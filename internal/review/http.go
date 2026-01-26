package review

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
	reviews := router.Group("/reviews")
	reviews.Post("/", middleware.AuthRequired, h.createHandler)
	reviews.Get("/", h.listHandler)
}

// createHandler creates a new review
// @Summary Create a new review
// @Description Create a review for a target (product, store, user)
// @Tags reviews
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param body body CreateReviewRequest true "Review details"
// @Success 201 {object} Review
// @Failure 400 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /reviews [post]
func (h *handler) createHandler(c *fiber.Ctx) error {
	var req CreateReviewRequest
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

	review := Review{
		AuthorID:   userID,
		TargetID:   req.TargetID,
		TargetType: req.TargetType,
		Rating:     req.Rating,
		Comment:    req.Comment,
	}

	created, err := h.repo.Create(c.Context(), review)
	if err != nil {
		return errors.Internal("failed to create review")
	}

	return c.Status(fiber.StatusCreated).JSON(created)
}

// listHandler lists reviews for a target
// @Summary List reviews
// @Description List reviews for a specific target
// @Tags reviews
// @Produce json
// @Param target_id query string true "Target ID"
// @Param target_type query string true "Target Type (product, store, user)"
// @Success 200 {array} Review
// @Failure 400 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /reviews [get]
func (h *handler) listHandler(c *fiber.Ctx) error {
	targetID := c.Query("target_id")
	targetType := c.Query("target_type")

	if targetID == "" || targetType == "" {
		return errors.BadRequest("target_id and target_type are required")
	}

	reviews, err := h.repo.List(c.Context(), targetID, targetType)
	if err != nil {
		return errors.Internal("failed to list reviews")
	}
	return c.JSON(reviews)
}
