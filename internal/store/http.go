package store

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
	store := router.Group("/store")
	// Stores
	store.Post("/", middleware.AuthRequired, h.createStoreHandler)
	store.Get("/me", middleware.AuthRequired, h.getMyStoreHandler)
	store.Get("/:id", h.getStoreHandler)
	store.Put("/:id", middleware.AuthRequired, h.updateStoreHandler)
}

// createStoreHandler creates a new store
// @Summary Create a new store
// @Description Create a new store for the authenticated user
// @Tags stores
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param body body CreateStoreRequest true "Store details"
// @Success 201 {object} Store
// @Failure 400 {object} errors.ErrorResponse
// @Failure 401 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /store [post]
func (h *handler) createStoreHandler(c *fiber.Ctx) error {
	var req CreateStoreRequest
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

	store := Store{
		Name:        req.Name,
		Description: req.Description,
		Location:    req.Location,
		Phone:       req.Phone,
		Email:       req.Email,
		SocialLinks: req.SocialLinks,
		OwnerID:     userID,
	}

	created, err := h.repo.CreateStore(c.Context(), store)
	if err != nil {
		return errors.Internal("failed to create store")
	}

	return c.Status(fiber.StatusCreated).JSON(created)
}

// getMyStoreHandler gets the authenticated user's store
// @Summary Get my store
// @Description Get the store owned by the authenticated user
// @Tags stores
// @Produce json
// @Security ApiKeyAuth
// @Success 200 {object} Store
// @Failure 401 {object} errors.ErrorResponse
// @Failure 404 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /store/me [get]
func (h *handler) getMyStoreHandler(c *fiber.Ctx) error {
	userID, ok := c.Locals("uid").(string)
	if !ok || userID == "" {
		return errors.Unauthorized("unauthorized")
	}

	store, err := h.repo.GetStoreByOwnerID(c.Context(), userID)
	if err != nil {
		return errors.NotFound("store not found")
	}

	return c.JSON(store)
}

// getStoreHandler gets a store by ID
// @Summary Get store by ID
// @Description Get public information about a store
// @Tags stores
// @Produce json
// @Param id path string true "Store ID"
// @Success 200 {object} Store
// @Failure 404 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /store/{id} [get]
func (h *handler) getStoreHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	store, err := h.repo.GetStoreByID(c.Context(), id)
	if err != nil {
		return errors.NotFound("store not found")
	}
	return c.JSON(store)
}

// updateStoreHandler updates a store
// @Summary Update a store
// @Description Update store details (only by owner)
// @Tags stores
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path string true "Store ID"
// @Param body body UpdateStoreRequest true "Updated store details"
// @Success 200 {object} Store
// @Failure 400 {object} errors.ErrorResponse
// @Failure 403 {object} errors.ErrorResponse
// @Failure 404 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /store/{id} [put]
func (h *handler) updateStoreHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateStoreRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.BadRequest("invalid request body")
	}

	if err := validator.ValidateStruct(&req); err != nil {
		return errors.BadRequest("validation failed: " + err.Error())
	}

	store, err := h.repo.GetStoreByID(c.Context(), id)
	if err != nil {
		return errors.NotFound("store not found")
	}

	userID, ok := c.Locals("uid").(string)
	if !ok || userID != store.OwnerID {
		return errors.Forbidden("not allowed to update this store")
	}

	store.Name = req.Name
	store.Description = req.Description
	store.Location = req.Location
	store.Phone = req.Phone
	store.Email = req.Email
	store.SocialLinks = req.SocialLinks

	if err := h.repo.UpdateStore(c.Context(), store); err != nil {
		return errors.Internal("failed to update store")
	}

	return c.JSON(store)
}
