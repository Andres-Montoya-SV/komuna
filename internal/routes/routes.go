package routes

import (
	"time"

	"github.com/gofiber/fiber/v2" // swagger handler
	"github.com/gofiber/swagger"
	"github.com/jackc/pgx/v5/pgxpool"

	_ "komuna/docs" // load API Docs files (it will create this)
	"komuna/internal/comment"
	"komuna/internal/community"
	"komuna/internal/errors"
	"komuna/internal/post"
	"komuna/internal/product"
	"komuna/internal/review"
	"komuna/internal/store"
	"komuna/internal/user"
)

func Register(app *fiber.App, dbPool *pgxpool.Pool, userRepo user.Repository) {
	// Swagger
	app.Get("/swagger/*", swagger.HandlerDefault)

	// Rutas públicas básicas (no versionadas)
	app.Get("/", rootHandler())
	app.Get("/health", healthHandler())
	app.Get("/ready", readyHandler(dbPool))
	app.Get("/db-test", dbTestHandler(dbPool))

	// API version
	api := app.Group("/api")
	v1 := api.Group("/v1")

	// User routes
	user.RegisterRoutes(v1, userRepo)

	// Community routes
	communityRepo := community.NewRepository(dbPool)
	community.RegisterRoutes(v1, communityRepo)

	// Store routes
	storeRepo := store.NewRepository(dbPool)
	store.RegisterRoutes(v1, storeRepo)

	// Product routes
	productRepo := product.NewRepository(dbPool)
	product.RegisterRoutes(v1, productRepo)

	// Review routes
	reviewRepo := review.NewRepository(dbPool)
	review.RegisterRoutes(v1, reviewRepo)

	// Comment routes
	commentRepo := comment.NewRepository(dbPool)
	comment.RegisterRoutes(v1, commentRepo)

	// Post routes
	postRepo := post.NewRepository(dbPool)
	post.RegisterRoutes(v1, postRepo)
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
