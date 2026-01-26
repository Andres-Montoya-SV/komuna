package comment

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
	comments := router.Group("/comments")
	comments.Post("/", middleware.AuthRequired, h.createHandler)
	comments.Get("/", h.listHandler)
}

// createHandler creates a new comment
// @Summary Create a new comment
// @Description Create a comment for a target (product, review, post)
// @Tags comments
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param body body CreateCommentRequest true "Comment details"
// @Success 201 {object} Comment
// @Failure 400 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /comments [post]
func (h *handler) createHandler(c *fiber.Ctx) error {
	var req CreateCommentRequest
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

	comment := Comment{
		AuthorID:   userID,
		TargetID:   req.TargetID,
		TargetType: req.TargetType,
		Content:    req.Content,
	}

	created, err := h.repo.Create(c.Context(), comment)
	if err != nil {
		return errors.Internal("failed to create comment")
	}

	return c.Status(fiber.StatusCreated).JSON(created)
}

// listHandler lists comments for a target
// @Summary List comments
// @Description List comments for a specific target
// @Tags comments
// @Produce json
// @Param target_id query string true "Target ID"
// @Param target_type query string true "Target Type"
// @Success 200 {array} Comment
// @Failure 400 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /comments [get]
func (h *handler) listHandler(c *fiber.Ctx) error {
	targetID := c.Query("target_id")
	targetType := c.Query("target_type")

	if targetID == "" || targetType == "" {
		return errors.BadRequest("target_id and target_type are required")
	}

	comments, err := h.repo.List(c.Context(), targetID, targetType)
	if err != nil {
		return errors.Internal("failed to list comments")
	}
	return c.JSON(comments)
}
