package ratelimit

import (
	"net/http/httptest"
	"testing"
	"time"

	appErrors "komuna/internal/errors"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestRateLimitMiddleware(t *testing.T) {
	app := fiber.New(fiber.Config{
		ErrorHandler: appErrors.Handler,
	})

	limiter := New(2, time.Minute)
	app.Use(FiberMiddleware(limiter))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("ok")
	})

	req := httptest.NewRequest("GET", "/", nil)

	resp, _ := app.Test(req)
	assert.Equal(t, 200, resp.StatusCode)

	resp, _ = app.Test(req)
	assert.Equal(t, 200, resp.StatusCode)

	resp, _ = app.Test(req)
	assert.Equal(t, 429, resp.StatusCode)
}
