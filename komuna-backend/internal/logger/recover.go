package logger

import (
	"runtime/debug"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

func Recover() fiber.Handler {
	return func(c *fiber.Ctx) (err error) {
		defer func() {
			if r := recover(); r != nil {

				requestID, _ := c.Locals("request_id").(string)

				Log.Error(
					"panic recovered",
					zap.Any("panic", r),
					zap.String("method", c.Method()),
					zap.String("path", c.Path()),
					zap.String("request_id", requestID),
					zap.ByteString("stack", debug.Stack()),
				)

				err = fiber.NewError(
					fiber.StatusInternalServerError,
					"internal server error",
				)
			}
		}()

		return c.Next()
	}
}
