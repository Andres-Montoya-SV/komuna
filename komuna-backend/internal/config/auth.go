package config

import "time"

type AuthConfig struct {
	JWTSecret      string
	AccessTokenTTL time.Duration
}
