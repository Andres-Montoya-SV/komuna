package logger

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func RequestID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		reqID := c.Get("X-Request-ID")
		if reqID == "" {
			reqID = uuid.NewString()
		}

		c.Locals("request_id", reqID)
		c.Set("X-Request-ID", reqID)

		return c.Next()
	}
}
