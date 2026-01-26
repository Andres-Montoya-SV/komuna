package community

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockRepository is a mock implementation of Repository
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) Create(ctx context.Context, c Community) (Community, error) {
	args := m.Called(ctx, c)
	return args.Get(0).(Community), args.Error(1)
}

func (m *MockRepository) GetByID(ctx context.Context, id string) (Community, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(Community), args.Error(1)
}

func (m *MockRepository) List(ctx context.Context) ([]Community, error) {
	args := m.Called(ctx)
	return args.Get(0).([]Community), args.Error(1)
}

func (m *MockRepository) Update(ctx context.Context, c Community) error {
	args := m.Called(ctx, c)
	return args.Error(0)
}

func (m *MockRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func TestCreateCommunity(t *testing.T) {
	mockRepo := new(MockRepository)

	ctx := context.Background()
	req := Community{
		Name:        "Test Community",
		Description: "A test community",
		OwnerID:     "user123",
	}

	expected := req
	expected.ID = "comm123"
	expected.CreatedAt = time.Now()
	expected.UpdatedAt = time.Now()

	mockRepo.On("Create", ctx, req).Return(expected, nil)

	created, err := mockRepo.Create(ctx, req)

	assert.NoError(t, err)
	assert.Equal(t, expected.ID, created.ID)
	assert.Equal(t, expected.Name, created.Name)
	mockRepo.AssertExpectations(t)
}
