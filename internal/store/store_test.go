package store

import (
	"bytes"
	"context"
	"encoding/json"
	"komuna/internal/errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockRepository is a mock implementation of Repository
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) CreateStore(ctx context.Context, s Store) (Store, error) {
	args := m.Called(ctx, s)
	return args.Get(0).(Store), args.Error(1)
}

func (m *MockRepository) GetStoreByID(ctx context.Context, id string) (Store, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(Store), args.Error(1)
}

func (m *MockRepository) GetStoreByOwnerID(ctx context.Context, ownerID string) (Store, error) {
	args := m.Called(ctx, ownerID)
	return args.Get(0).(Store), args.Error(1)
}

func (m *MockRepository) UpdateStore(ctx context.Context, s Store) error {
	args := m.Called(ctx, s)
	return args.Error(0)
}

func TestCreateStore(t *testing.T) {
	app := fiber.New(fiber.Config{
		ErrorHandler: errors.Handler,
	})
	mockRepo := new(MockRepository)
	h := &handler{repo: mockRepo}

	// Middleware to inject user
	app.Post("/store", func(c *fiber.Ctx) error {
		c.Locals("uid", "user123")
		return c.Next()
	}, h.createStoreHandler)

	t.Run("Success", func(t *testing.T) {
		reqBody := CreateStoreRequest{
			Name:        "Test Store",
			Description: "Best store ever",
			Email:       "store@example.com",
		}
		bodyBytes, _ := json.Marshal(reqBody)

		expectedStore := Store{
			ID:          "store123",
			OwnerID:     "user123",
			Name:        reqBody.Name,
			Description: reqBody.Description,
			Email:       reqBody.Email,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		mockRepo.On("CreateStore", mock.Anything, mock.MatchedBy(func(s Store) bool {
			return s.Name == reqBody.Name && s.OwnerID == "user123"
		})).Return(expectedStore, nil)

		req := httptest.NewRequest("POST", "/store", bytes.NewReader(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)
	})
}

func TestGetStore(t *testing.T) {
	app := fiber.New(fiber.Config{
		ErrorHandler: errors.Handler,
	})
	mockRepo := new(MockRepository)
	h := &handler{repo: mockRepo}

	app.Get("/store/:id", h.getStoreHandler)

	t.Run("Success", func(t *testing.T) {
		expectedStore := Store{
			ID:   "store123",
			Name: "Test Store",
		}
		mockRepo.On("GetStoreByID", mock.Anything, "store123").Return(expectedStore, nil)

		req := httptest.NewRequest("GET", "/store/store123", nil)
		resp, err := app.Test(req)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("Not Found", func(t *testing.T) {
		mockRepo.On("GetStoreByID", mock.Anything, "unknown").Return(Store{}, assert.AnError)

		req := httptest.NewRequest("GET", "/store/unknown", nil)
		resp, _ := app.Test(req)

		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}
