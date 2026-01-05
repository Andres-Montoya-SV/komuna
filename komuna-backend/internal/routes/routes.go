package routes

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"

	"komuna/internal/auth"
	"komuna/internal/errors"
	"komuna/internal/user"
)

func Register(app *fiber.App, dbPool *pgxpool.Pool, authCfg auth.Config) {
	// Rutas públicas básicas (no versionadas)
	app.Get("/", rootHandler())
	app.Get("/health", healthHandler())
	app.Get("/ready", readyHandler(dbPool))
	app.Get("/db-test", dbTestHandler(dbPool))

	// API version
	api := app.Group("/api")
	v1 := api.Group("/v1")

	// User routes
	user.RegisterRoutes(v1, dbPool, authCfg)
}

func rootHandler() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.SendString("Komuna API running")
	}
}

func healthHandler() fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"time":   time.Now(),
		})
	}
}

func readyHandler(dbPool *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if err := dbPool.Ping(c.UserContext()); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"status": "db_down",
			})
		}

		return c.JSON(fiber.Map{
			"status": "ready",
		})
	}
}

func dbTestHandler(dbPool *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var now time.Time

		err := dbPool.
			QueryRow(c.UserContext(), "SELECT NOW()").
			Scan(&now)

		if err != nil {
			return errors.Internal("database query failed")
		}

		return c.SendString("Database time: " + now.String())
	}
}
