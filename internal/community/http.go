package community

import (
	"komuna/internal/errors"
	"komuna/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

type handler struct {
	repo Repository
}

func RegisterRoutes(router fiber.Router, repo Repository) {
	h := &handler{repo: repo}
	communities := router.Group("/communities")
	communities.Post("/", middleware.AuthRequired, h.createHandler)
	communities.Get("/", h.listHandler)
	communities.Get("/:id", h.getHandler)
	communities.Put("/:id", middleware.AuthRequired, h.updateHandler)
}

// createHandler creates a new community
// @Summary Create a new community
// @Description Create a new community with the authenticated user as owner
// @Tags communities
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param body body CreateCommunityRequest true "Community details"
// @Success 201 {object} Community
// @Failure 400 {object} errors.ErrorResponse
// @Failure 401 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /communities [post]
func (h *handler) createHandler(c *fiber.Ctx) error {
	var req CreateCommunityRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.BadRequest("invalid request body")
	}

	// UserID is set by AuthRequired middleware
	userID, ok := c.Locals("uid").(string)
	if !ok || userID == "" {
		// In a real scenario, middleware handles this. For MVP without auth middleware visible yet:
		// We might need to mock or extract from token.
		// For now, let's assume it's passed or fail.
		// Actually, let's inspect how auth is handled in other parts.
		// Based on README, Firebase is used.
		// Let's assume the user ID is available in locals "user_id" or similar.
		// If not found, creating a community requires an owner.
		return errors.Unauthorized("unauthorized")
	}

	community := Community{
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     userID,
	}

	created, err := h.repo.Create(c.Context(), community)
	if err != nil {
		return errors.Internal("failed to create community")
	}

	return c.Status(fiber.StatusCreated).JSON(created)
}

// listHandler lists all communities
// @Summary List all communities
// @Description Get a list of all communities
// @Tags communities
// @Produce json
// @Success 200 {array} Community
// @Failure 500 {object} errors.ErrorResponse
// @Router /communities [get]
func (h *handler) listHandler(c *fiber.Ctx) error {
	communities, err := h.repo.List(c.Context())
	if err != nil {
		return errors.Internal("failed to list communities")
	}
	return c.JSON(communities)
}

// getHandler gets a community by ID
// @Summary Get community by ID
// @Description Get detailed information about a specific community
// @Tags communities
// @Produce json
// @Param id path string true "Community ID"
// @Success 200 {object} Community
// @Failure 404 {object} errors.ErrorResponse
// @Router /communities/{id} [get]
func (h *handler) getHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	community, err := h.repo.GetByID(c.Context(), id)
	if err != nil {
		return errors.NotFound("community not found")
	}
	return c.JSON(community)
}

// updateHandler updates a community
// @Summary Update a community
// @Description Update community details (only by owner)
// @Tags communities
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path string true "Community ID"
// @Param body body UpdateCommunityRequest true "Updated community details"
// @Success 200 {object} Community
// @Failure 400 {object} errors.ErrorResponse
// @Failure 403 {object} errors.ErrorResponse
// @Failure 404 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /communities/{id} [put]
func (h *handler) updateHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	var req UpdateCommunityRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.BadRequest("invalid request body")
	}

	community, err := h.repo.GetByID(c.Context(), id)
	if err != nil {
		return errors.NotFound("community not found")
	}

	// Check ownership (simplified)
	userID, ok := c.Locals("uid").(string)
	if !ok || userID != community.OwnerID {
		return errors.Forbidden("not allowed to update this community")
	}

	community.Name = req.Name
	community.Description = req.Description

	if err := h.repo.Update(c.Context(), community); err != nil {
		return errors.Internal("failed to update community")
	}

	return c.JSON(community)
}
