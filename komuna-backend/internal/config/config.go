package config

import (
	"log"
	"os"

	"komuna/internal/config/helpers"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv      string
	Port        string
	DatabaseURL string
	JwtSecret   string
}

func Load() Config {
	if os.Getenv("APP_ENV") == "" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, using system env vars")
		}
	}

	log.Println("Loading configuration...")

	return Config{
		AppEnv:      helpers.GetEnv("APP_ENV", "development"),
		Port:        helpers.GetEnv("PORT", "2077"),
		DatabaseURL: helpers.MustEnv("DATABASE_URL"),
		JwtSecret:   helpers.MustEnv("JWT_SECRET"),
	}
}
