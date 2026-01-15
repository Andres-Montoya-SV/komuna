package ratelimit

import (
	"github.com/gofiber/fiber/v2"

	"komuna/internal/errors"
)

func FiberMiddleware(l *Limiter) fiber.Handler {
	return func(c *fiber.Ctx) error {

		ip := c.IP()
		if ip == "" {
			ip = "unknown"
		}

		if !l.Allow(ip) {
			return errors.TooManyRequests("rate limit exceeded")
		}

		return c.Next()
	}
}
