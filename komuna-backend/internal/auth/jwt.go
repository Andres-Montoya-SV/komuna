package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Config struct {
	Secret       string
	AccessExpiry time.Duration
}

type Claims struct {
	Username      string `json:"username"`
	EmailVerified bool   `json:"email_verified"`
	jwt.RegisteredClaims
}

func GenerateAccessToken(cfg Config, userID string, username string, emailVerified bool) (string, error) {
	now := time.Now()

	claims := Claims{
		Username:      username,
		EmailVerified: emailVerified,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(cfg.AccessExpiry)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.Secret))
}
