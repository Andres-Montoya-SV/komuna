// internal/db/db.go
package db

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func New(databaseURL string) *pgxpool.Pool {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatal("Failed to create DB pool:", err)
	}

	if err := pool.Ping(ctx); err != nil {
		log.Fatal("Failed to connect to DB:", err)
	}

	log.Println("Database connected")

	return pool
}
