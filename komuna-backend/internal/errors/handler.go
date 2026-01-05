package errors

import (
	"komuna/internal/logger"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func Handler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Ha ocurrido un error inesperado"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	if e, ok := err.(*HTTPError); ok {
		code = e.Code
		message = e.Message
	}

	reqID, _ := c.Locals("request_id").(string)

	// Solo log ERRORs reales del sistema
	if code >= 500 {
		logger.Log.Error(
			"request failed",
			zap.Int("status", code),
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.String("request_id", reqID),
			zap.Error(err),
		)
	}

	return c.Status(code).JSON(fiber.Map{
		"error":      message,
		"request_id": reqID,
	})
}
