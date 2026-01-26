package product

import (
	"bytes"
	"context"
	"encoding/json"
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

func (m *MockRepository) Create(ctx context.Context, p Product) (Product, error) {
	args := m.Called(ctx, p)
	return args.Get(0).(Product), args.Error(1)
}

func (m *MockRepository) GetByID(ctx context.Context, id string) (Product, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(Product), args.Error(1)
}

func (m *MockRepository) List(ctx context.Context, filters map[string]interface{}) ([]Product, error) {
	args := m.Called(ctx, filters)
	return args.Get(0).([]Product), args.Error(1)
}

func (m *MockRepository) Update(ctx context.Context, p Product) error {
	args := m.Called(ctx, p)
	return args.Error(0)
}

func TestCreateProduct(t *testing.T) {
	app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
	mockRepo := new(MockRepository)
	h := &handler{repo: mockRepo}

	// Simulate auth middleware
	app.Post("/products", func(c *fiber.Ctx) error {
		c.Locals("uid", "user123")
		return c.Next()
	}, h.createHandler)

	reqBody := CreateProductRequest{
		Name:          "Test Product",
		Description:   "A test product",
		Price:         99.99,
		Quality:       "New",
		StockQuantity: 10,
	}
	bodyBytes, _ := json.Marshal(reqBody)

	expectedProduct := Product{
		ID:            "prod123",
		Name:          reqBody.Name,
		Description:   reqBody.Description,
		Price:         reqBody.Price,
		Quality:       reqBody.Quality,
		StockQuantity: reqBody.StockQuantity,
		SellerID:      "user123",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	mockRepo.On("Create", mock.Anything, mock.MatchedBy(func(p Product) bool {
		return p.Name == reqBody.Name && p.SellerID == "user123"
	})).Return(expectedProduct, nil)

	req := httptest.NewRequest("POST", "/products", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)

	var respBody Product
	err = json.NewDecoder(resp.Body).Decode(&respBody)
	assert.NoError(t, err)
	assert.Equal(t, expectedProduct.ID, respBody.ID)
}

func TestGetProduct(t *testing.T) {
	app := fiber.New(fiber.Config{ErrorHandler: errors.Handler})
	mockRepo := new(MockRepository)
	h := &handler{repo: mockRepo}
	app.Get("/products/:id", h.getHandler)

	t.Run("Success", func(t *testing.T) {
		expectedProduct := Product{ID: "prod123", Name: "Existing Product"}
		mockRepo.On("GetByID", mock.Anything, "prod123").Return(expectedProduct, nil)
		req := httptest.NewRequest("GET", "/products/prod123", nil)
		resp, err := app.Test(req)
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("Not Found", func(t *testing.T) {
		mockRepo.On("GetByID", mock.Anything, "unknown").Return(Product{}, assert.AnError)
		req := httptest.NewRequest("GET", "/products/unknown", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}
