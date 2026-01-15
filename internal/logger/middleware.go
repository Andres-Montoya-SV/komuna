package logger

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func FiberMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		err := c.Next()

		latency := time.Since(start)
		status := c.Response().StatusCode()

		reqID, _ := c.Locals("request_id").(string)

		fields := []zap.Field{
			zap.String("request_id", reqID),
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.Int("status", status),
			zap.String("latency", latency.String()),
			zap.String("ip", c.IP()),
			zap.String("user_agent", c.Get("User-Agent")),
		}

		switch {
		case status >= 500:
			Log.Error("request failed", fields...)
		case status >= 400:
			Log.Warn("client error", fields...)
		default:
			Log.Info("request completed", fields...)
		}

		return err
	}
}
