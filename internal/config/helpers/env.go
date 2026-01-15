package helpers

import (
	"log"
	"os"
)

func MustEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("Missing required env var: %s", key)
	}
	return val
}

func GetEnv(key string, def string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return def
}
