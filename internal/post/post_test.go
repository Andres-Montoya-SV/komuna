package post

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"komuna/internal/errors"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockRepository is a mock implementation of Repository
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) Create(ctx context.Context, p Post) (Post, error) {
	args := m.Called(ctx, p)
	return args.Get(0).(Post), args.Error(1)
}

func (m *MockRepository) GetByID(ctx context.Context, id string) (Post, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(Post), args.Error(1)
}

func (m *MockRepository) List(ctx context.Context, filters map[string]interface{}) ([]Post, error) {
	args := m.Called(ctx, filters)
	return args.Get(0).([]Post), args.Error(1)
}

func (m *MockRepository) Update(ctx context.Context, p Post) error {
	args := m.Called(ctx, p)
	return args.Error(0)
}

func (m *MockRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestCreatePost(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}

		// Simulate auth middleware
		app.Post("/posts", func(c *fiber.Ctx) error {
			c.Locals("uid", "user123")
			return c.Next()
		}, h.createHandler)
		reqBody := CreatePostRequest{
			Title:       "Test Post",
			Content:     "This is a test post content",
			CommunityID: "comm123",
		}
		bodyBytes, _ := json.Marshal(reqBody)

		expectedPost := Post{
			ID:          "post123",
			Title:       reqBody.Title,
			Content:     reqBody.Content,
			AuthorID:    "user123",
			CommunityID: &reqBody.CommunityID,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
			IsDeleted:   false,
		}

		mockRepo.On("Create", mock.Anything, mock.MatchedBy(func(p Post) bool {
			return p.Title == reqBody.Title && p.AuthorID == "user123" && *p.CommunityID == reqBody.CommunityID
		})).Return(expectedPost, nil)

		req := httptest.NewRequest("POST", "/posts", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var respBody Post
		err = json.NewDecoder(resp.Body).Decode(&respBody)
		assert.NoError(t, err)
		assert.Equal(t, expectedPost.ID, respBody.ID)
		assert.Equal(t, expectedPost.Title, respBody.Title)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Success without community", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}

		// Simulate auth middleware
		app.Post("/posts", func(c *fiber.Ctx) error {
			c.Locals("uid", "user123")
			return c.Next()
		}, h.createHandler)
		reqBody := CreatePostRequest{
			Title:   "Standalone Post",
			Content: "This post is not in a community",
		}
		bodyBytes, _ := json.Marshal(reqBody)

		expectedPost := Post{
			ID:        "post456",
			Title:     reqBody.Title,
			Content:   reqBody.Content,
			AuthorID:  "user123",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			IsDeleted: false,
		}

		mockRepo.On("Create", mock.Anything, mock.MatchedBy(func(p Post) bool {
			return p.Title == reqBody.Title && p.AuthorID == "user123" && p.CommunityID == nil
		})).Return(expectedPost, nil)

		req := httptest.NewRequest("POST", "/posts", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Invalid request body", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}

		// Simulate auth middleware
		app.Post("/posts", func(c *fiber.Ctx) error {
			c.Locals("uid", "user123")
			return c.Next()
		}, h.createHandler)
		req := httptest.NewRequest("POST", "/posts", bytes.NewReader([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

func TestGetPost(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}
		app.Get("/posts/:id", h.getHandler)
		expectedPost := Post{
			ID:        "post123",
			Title:     "Test Post",
			Content:   "Post content",
			AuthorID:  "user123",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			IsDeleted: false,
		}
		mockRepo.On("GetByID", mock.Anything, "post123").Return(expectedPost, nil)

		req := httptest.NewRequest("GET", "/posts/post123", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var respBody Post
		err = json.NewDecoder(resp.Body).Decode(&respBody)
		assert.NoError(t, err)
		assert.Equal(t, expectedPost.ID, respBody.ID)
		assert.Equal(t, expectedPost.Title, respBody.Title)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}
		app.Get("/posts/:id", h.getHandler)

		mockRepo.On("GetByID", mock.Anything, "unknown").Return(Post{}, fmt.Errorf("post not found"))

		req := httptest.NewRequest("GET", "/posts/unknown", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
		mockRepo.AssertExpectations(t)
	})
}

func TestListPosts(t *testing.T) {
	t.Run("Success - All posts", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}
		app.Get("/posts", h.listHandler)
		expectedPosts := []Post{
			{
				ID:        "post1",
				Title:     "Post 1",
				Content:   "Content 1",
				AuthorID:  "user1",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
				IsDeleted: false,
			},
			{
				ID:        "post2",
				Title:     "Post 2",
				Content:   "Content 2",
				AuthorID:  "user2",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
				IsDeleted: false,
			},
		}

		mockRepo.On("List", mock.Anything, mock.MatchedBy(func(filters map[string]interface{}) bool {
			return len(filters) == 0
		})).Return(expectedPosts, nil)

		req := httptest.NewRequest("GET", "/posts", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var respBody []Post
		err = json.NewDecoder(resp.Body).Decode(&respBody)
		assert.NoError(t, err)
		assert.Len(t, respBody, 2)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Success - Filter by community", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}
		app.Get("/posts", h.listHandler)
		expectedPosts := []Post{
			{
				ID:          "post1",
				Title:       "Post in community",
				Content:     "Content",
				AuthorID:    "user1",
				CommunityID: stringPtr("comm123"),
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
				IsDeleted:   false,
			},
		}

		mockRepo.On("List", mock.Anything, mock.MatchedBy(func(filters map[string]interface{}) bool {
			return filters["community_id"] == "comm123"
		})).Return(expectedPosts, nil)

		req := httptest.NewRequest("GET", "/posts?community_id=comm123", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Success - Filter by author", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}
		app.Get("/posts", h.listHandler)
		expectedPosts := []Post{
			{
				ID:        "post1",
				Title:     "My Post",
				Content:   "Content",
				AuthorID:  "user123",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
				IsDeleted: false,
			},
		}

		mockRepo.On("List", mock.Anything, mock.MatchedBy(func(filters map[string]interface{}) bool {
			return filters["author_id"] == "user123"
		})).Return(expectedPosts, nil)

		req := httptest.NewRequest("GET", "/posts?author_id=user123", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		mockRepo.AssertExpectations(t)
	})
}

func TestUpdatePost(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}

		// Simulate auth middleware
		app.Put("/posts/:id", func(c *fiber.Ctx) error {
			c.Locals("uid", "user123")
			return c.Next()
		}, h.updateHandler)
		existingPost := Post{
			ID:        "post123",
			Title:     "Original Title",
			Content:   "Original content",
			AuthorID:  "user123",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			IsDeleted: false,
		}

		reqBody := UpdatePostRequest{
			Title:   "Updated Title",
			Content: "Updated content",
		}
		bodyBytes, _ := json.Marshal(reqBody)

		mockRepo.On("GetByID", mock.Anything, "post123").Return(existingPost, nil)
		mockRepo.On("Update", mock.Anything, mock.MatchedBy(func(p Post) bool {
			return p.ID == "post123" && p.Title == reqBody.Title && p.Content == reqBody.Content
		})).Return(nil)

		req := httptest.NewRequest("PUT", "/posts/post123", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}

		// Simulate auth middleware
		app.Put("/posts/:id", func(c *fiber.Ctx) error {
			c.Locals("uid", "user123")
			return c.Next()
		}, h.updateHandler)

		mockRepo.On("GetByID", mock.Anything, "unknown").Return(Post{}, fmt.Errorf("post not found"))

		reqBody := UpdatePostRequest{
			Title:   "Updated Title",
			Content: "Updated content",
		}
		bodyBytes, _ := json.Marshal(reqBody)

		req := httptest.NewRequest("PUT", "/posts/unknown", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Forbidden - Not author", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}

		// Simulate auth middleware
		app.Put("/posts/:id", func(c *fiber.Ctx) error {
			c.Locals("uid", "user123")
			return c.Next()
		}, h.updateHandler)

		existingPost := Post{
			ID:        "post123",
			Title:     "Original Title",
			Content:   "Original content",
			AuthorID:  "other-user",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			IsDeleted: false,
		}

		mockRepo.On("GetByID", mock.Anything, "post123").Return(existingPost, nil)

		reqBody := UpdatePostRequest{
			Title:   "Updated Title",
			Content: "Updated content",
		}
		bodyBytes, _ := json.Marshal(reqBody)

		req := httptest.NewRequest("PUT", "/posts/post123", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
		mockRepo.AssertExpectations(t)
	})
}

func TestDeletePost(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}

		// Simulate auth middleware
		app.Delete("/posts/:id", func(c *fiber.Ctx) error {
			c.Locals("uid", "user123")
			return c.Next()
		}, h.deleteHandler)
		existingPost := Post{
			ID:        "post123",
			Title:     "Post to delete",
			Content:   "Content",
			AuthorID:  "user123",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			IsDeleted: false,
		}

		mockRepo.On("GetByID", mock.Anything, "post123").Return(existingPost, nil)
		mockRepo.On("Delete", mock.Anything, "post123").Return(nil)

		req := httptest.NewRequest("DELETE", "/posts/post123", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var respBody map[string]string
		err = json.NewDecoder(resp.Body).Decode(&respBody)
		assert.NoError(t, err)
		assert.Equal(t, "post deleted successfully", respBody["message"])
		mockRepo.AssertExpectations(t)
	})

	t.Run("Not Found", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}

		// Simulate auth middleware
		app.Delete("/posts/:id", func(c *fiber.Ctx) error {
			c.Locals("uid", "user123")
			return c.Next()
		}, h.deleteHandler)

		mockRepo.On("GetByID", mock.Anything, "unknown").Return(Post{}, fmt.Errorf("post not found"))

		req := httptest.NewRequest("DELETE", "/posts/unknown", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Forbidden - Not author", func(t *testing.T) {
		app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
		mockRepo := new(MockRepository)
		h := &handler{repo: mockRepo}

		// Simulate auth middleware
		app.Delete("/posts/:id", func(c *fiber.Ctx) error {
			c.Locals("uid", "user123")
			return c.Next()
		}, h.deleteHandler)

		existingPost := Post{
			ID:        "post123",
			Title:     "Post to delete",
			Content:   "Content",
			AuthorID:  "other-user",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			IsDeleted: false,
		}

		mockRepo.On("GetByID", mock.Anything, "post123").Return(existingPost, nil)

		req := httptest.NewRequest("DELETE", "/posts/post123", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
		mockRepo.AssertExpectations(t)
	})
}

// Helper function to create string pointer
func stringPtr(s string) *string {
	return &s
}
