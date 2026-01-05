package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"go.uber.org/zap"

	"komuna/internal/config"
	"komuna/internal/db"
	"komuna/internal/errors"
	"komuna/internal/firebase"
	"komuna/internal/logger"
	"komuna/internal/ratelimit"
	"komuna/internal/routes"
)

func main() {
	// =========================
	// Config
	// =========================
	cfg := config.Load()

	// =========================
	// Logger
	// =========================
	logger.Init(cfg.AppEnv)
	defer logger.Sync()

	// =========================
	// Database
	// =========================
	dbPool := db.New(cfg.DatabaseURL)
	defer dbPool.Close()

	// =========================
	// Rate limiter
	// =========================
	limiter := ratelimit.New(100, time.Minute)

	// =========================
	// Fiber app
	// =========================
	app := fiber.New(fiber.Config{
		ErrorHandler: errors.Handler,
	})

	// =========================
	// App level logger by ID
	// =========================
	app.Use(logger.RequestID())

	// =========================
	// Firebase Authentication
	// =========================
	if _, err := firebase.Init(); err != nil {
		logger.Log.Fatal("failed to initialize Firebase", zap.Error(err))
	}
	log.Println("Firebase initialized")

	// Verificar salud de Firebase
	ctx := context.Background()
	if err := firebase.CheckHealth(ctx); err != nil {
		logger.Log.Warn("Firebase health check failed", zap.Error(err))
		logger.Log.Info("This may cause authentication to fail. Please check your Firebase configuration.")
	} else {
		log.Println("Firebase health check passed")
	}

	// =========================
	// Panic isolation (PER REQUEST)
	// =========================
	app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
	}))

	// =========================
	// Global timeout via context (SAFE)
	// =========================
	app.Use(func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(c.UserContext(), 10*time.Second)
		defer cancel()

		c.SetUserContext(ctx)
		return c.Next()
	})

	// =========================
	// Middlewares
	// =========================
	app.Use(ratelimit.FiberMiddleware(limiter))
	app.Use(logger.FiberMiddleware())

	// =========================
	// Routes
	// =========================
	routes.Register(app, dbPool)

	// =========================
	// Graceful shutdown
	// =========================
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Printf("Komuna API listening on :%s", cfg.Port)
		if err := app.Listen(":" + cfg.Port); err != nil {
			logger.Log.Fatal("server failed to start", zap.Error(err))
		}
	}()

	<-ctx.Done()
	log.Println("shutdown signal received")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(shutdownCtx); err != nil {
		log.Println("server shutdown error:", err)
	}

	log.Println("server stopped gracefully")
}
