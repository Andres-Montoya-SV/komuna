package post

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
	posts := router.Group("/posts")
	posts.Post("/", middleware.AuthRequired, h.createHandler)
	posts.Get("/", h.listHandler)
	posts.Get("/:id", h.getHandler)
	posts.Put("/:id", middleware.AuthRequired, h.updateHandler)
	posts.Delete("/:id", middleware.AuthRequired, h.deleteHandler)
}

// createHandler creates a new post
// @Summary Create a new post
// @Description Create a new post. Can be linked to a community or standalone.
// @Tags posts
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param body body CreatePostRequest true "Post details"
// @Success 201 {object} Post
// @Failure 400 {object} errors.ErrorResponse
// @Failure 401 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /posts [post]
func (h *handler) createHandler(c *fiber.Ctx) error {
	var req CreatePostRequest
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

	var communityID *string
	if req.CommunityID != "" {
		communityID = &req.CommunityID
	}

	post := Post{
		Title:       req.Title,
		Content:     req.Content,
		AuthorID:    userID,
		CommunityID: communityID,
	}

	created, err := h.repo.Create(c.Context(), post)
	if err != nil {
		return errors.Internal("failed to create post")
	}

	return c.Status(fiber.StatusCreated).JSON(created)
}

// listHandler lists posts
// @Summary List posts
// @Description List posts with optional filters (community_id, author_id)
// @Tags posts
// @Produce json
// @Param community_id query string false "Community ID"
// @Param author_id query string false "Author ID"
// @Success 200 {array} Post
// @Failure 500 {object} errors.ErrorResponse
// @Router /posts [get]
func (h *handler) listHandler(c *fiber.Ctx) error {
	filters := make(map[string]interface{})
	if val := c.Query("community_id"); val != "" {
		filters["community_id"] = val
	}
	if val := c.Query("author_id"); val != "" {
		filters["author_id"] = val
	}

	posts, err := h.repo.List(c.Context(), filters)
	if err != nil {
		return errors.Internal("failed to list posts")
	}
	return c.JSON(posts)
}

// getHandler gets a post by ID
// @Summary Get post by ID
// @Description Get detailed information about a specific post
// @Tags posts
// @Produce json
// @Param id path string true "Post ID"
// @Success 200 {object} Post
// @Failure 404 {object} errors.ErrorResponse
// @Router /posts/{id} [get]
func (h *handler) getHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	post, err := h.repo.GetByID(c.Context(), id)
	if err != nil {
		return errors.NotFound("post not found")
	}
	return c.JSON(post)
}

// updateHandler updates a post
// @Summary Update a post
// @Description Update post details (only by author)
// @Tags posts
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path string true "Post ID"
// @Param body body UpdatePostRequest true "Updated post details"
// @Success 200 {object} Post
// @Failure 400 {object} errors.ErrorResponse
// @Failure 403 {object} errors.ErrorResponse
// @Failure 404 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /posts/{id} [put]
func (h *handler) updateHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	var req UpdatePostRequest
	if err := c.BodyParser(&req); err != nil {
		return errors.BadRequest("invalid request body")
	}

	if err := validator.ValidateStruct(&req); err != nil {
		return errors.BadRequest("validation failed: " + err.Error())
	}

	post, err := h.repo.GetByID(c.Context(), id)
	if err != nil {
		return errors.NotFound("post not found")
	}

	userID, ok := c.Locals("uid").(string)
	if !ok || userID != post.AuthorID {
		return errors.Forbidden("not allowed to update this post")
	}

	post.Title = req.Title
	post.Content = req.Content

	if err := h.repo.Update(c.Context(), post); err != nil {
		return errors.Internal("failed to update post")
	}

	return c.JSON(post)
}

// deleteHandler deletes a post (soft delete)
// @Summary Delete a post
// @Description Soft delete a post (only by author)
// @Tags posts
// @Produce json
// @Security ApiKeyAuth
// @Param id path string true "Post ID"
// @Success 200 {object} map[string]string
// @Failure 403 {object} errors.ErrorResponse
// @Failure 404 {object} errors.ErrorResponse
// @Failure 500 {object} errors.ErrorResponse
// @Router /posts/{id} [delete]
func (h *handler) deleteHandler(c *fiber.Ctx) error {
	id := c.Params("id")

	post, err := h.repo.GetByID(c.Context(), id)
	if err != nil {
		return errors.NotFound("post not found")
	}

	userID, ok := c.Locals("uid").(string)
	if !ok || userID != post.AuthorID {
		return errors.Forbidden("not allowed to delete this post")
	}

	if err := h.repo.Delete(c.Context(), id); err != nil {
		return errors.Internal("failed to delete post")
	}

	return c.JSON(fiber.Map{
		"message": "post deleted successfully",
	})
}
