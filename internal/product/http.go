package product

import (
	"komuna/internal/errors"
	"komuna/internal/middleware"
	"komuna/internal/validator"

	"github.com/gofiber/fiber/v2"
)

type handler struct {
	repo Repository
}

func RegisterRoutes(router fiber.Router, repo Repository) {
	h := &handler{repo: repo}
	products := router.Group("/products")
	products.Post("/", middleware.AuthRequired, h.createHandler)
	products.Get("/", h.listHandler)
	products.Get("/:id", h.getHandler)
	products.Put("/:id", middleware.AuthRequired, h.updateHandler)
}

// createHandler creates a new product
// @Summary Create a new product
// @Description Create a new product. Can be linked to a store or just a user profile.
// @Tags products
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param body body CreateProductRequest true "Product details"
// @Success 201 {object} Product
// @Failure 400 {object} errors.ErrorResponse
// @Failure 401 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /products [post]
func (h *handler) createHandler(c *fiber.Ctx) error {
	var req CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.BadRequest("invalid request body")
	}

	if err := validator.ValidateStruct(&req); err != nil {
		return errors.BadRequest("validation failed: " + err.Error())
	}

	userID, ok := c.Locals("uid").(string)
	if !ok || userID == "" {
		return errors.Unauthorized("unauthorized")
	}

	var storeID *string
	if req.StoreID != "" {
		storeID = &req.StoreID
	}

	var communityID *string
	if req.CommunityID != "" {
		communityID = &req.CommunityID
	}

	product := Product{
		Name:          req.Name,
		Description:   req.Description,
		Price:         req.Price,
		Quality:       req.Quality,
		StockQuantity: req.StockQuantity,
		CommunityID:   communityID,
		StoreID:       storeID,
		SellerID:      userID,
	}

	created, err := h.repo.Create(c.Context(), product)
	if err != nil {
		return errors.Internal("failed to create product")
	}

	return c.Status(fiber.StatusCreated).JSON(created)
}

// listHandler lists products
// @Summary List products
// @Description List products with optional filters (community_id, store_id, seller_id)
// @Tags products
// @Produce json
// @Param community_id query string false "Community ID"
// @Param store_id query string false "Store ID"
// @Param seller_id query string false "Seller ID"
// @Success 200 {array} Product
// @Failure 500 {object} errors.ErrorResponse
// @Router /products [get]
func (h *handler) listHandler(c *fiber.Ctx) error {
	filters := make(map[string]interface{})
	if val := c.Query("community_id"); val != "" {
		filters["community_id"] = val
	}
	if val := c.Query("store_id"); val != "" {
		filters["store_id"] = val
	}
	if val := c.Query("seller_id"); val != "" {
		filters["seller_id"] = val
	}

	products, err := h.repo.List(c.Context(), filters)
	if err != nil {
		return errors.Internal("failed to list products")
	}
	return c.JSON(products)
}

// getHandler gets a product by ID
// @Summary Get product by ID
// @Description Get detailed information about a specific product
// @Tags products
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} Product
// @Failure 404 {object} errors.ErrorResponse
// @Router /products/{id} [get]
func (h *handler) getHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	product, err := h.repo.GetByID(c.Context(), id)
	if err != nil {
		return errors.NotFound("product not found")
	}
	return c.JSON(product)
}

// updateHandler updates a product
// @Summary Update a product
// @Description Update product details (only by seller)
// @Tags products
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path string true "Product ID"
// @Param body body CreateProductRequest true "Updated product details"
// @Success 200 {object} Product
// @Failure 400 {object} errors.ErrorResponse
// @Failure 403 {object} errors.ErrorResponse
// @Failure 404 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /products/{id} [put]
func (h *handler) updateHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	var req CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.BadRequest("invalid request body")
	}

	if err := validator.ValidateStruct(&req); err != nil {
		return errors.BadRequest("validation failed: " + err.Error())
	}

	product, err := h.repo.GetByID(c.Context(), id)
	if err != nil {
		return errors.NotFound("product not found")
	}

	userID, ok := c.Locals("uid").(string)
	if !ok || userID != product.SellerID {
		return errors.Forbidden("not allowed to update this product")
	}

	product.Name = req.Name
	product.Description = req.Description
	product.Price = req.Price
	product.Quality = req.Quality
	product.StockQuantity = req.StockQuantity

	if err := h.repo.Update(c.Context(), product); err != nil {
		return errors.Internal("failed to update product")
	}

	return c.JSON(product)
}
