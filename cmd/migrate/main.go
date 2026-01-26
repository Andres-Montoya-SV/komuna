package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system env vars")
	}

	log.Println("Starting database schema migration...")

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	ctx := context.Background()
	db, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(ctx); err != nil {
		log.Fatalf("Unable to ping database: %v", err)
	}

	// Read tableSchema.sql
	// Assuming the binary is run from the project root
	schemaSQL, err := os.ReadFile("migrations/tableSchema.sql")
	if err != nil {
		log.Fatalf("Failed to read migrations/tableSchema.sql: %v", err)
	}

	log.Println("Applying schema...")
	_, err = db.Exec(ctx, string(schemaSQL))
	if err != nil {
		log.Fatalf("Failed to execute schema sql: %v", err)
	}

	log.Println("Database schema updated successfully.")
}
