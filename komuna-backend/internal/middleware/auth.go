package middleware

import (
	"context"
	"strings"

	"komuna/internal/errors"
	"komuna/internal/firebase"

	"github.com/gofiber/fiber/v2"
)

// AuthRequired protects routes by verifying the Firebase ID Token.
// It stores the "uid" and the raw "token" in the context locals.
func AuthRequired(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return errors.Unauthorized("missing authorization header")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return errors.Unauthorized("invalid authorization format")
	}

	idToken := parts[1]

	// Verify token with Firebase
	token, err := firebase.VerifyToken(c.Context(), idToken)
	if err != nil {
		return errors.Unauthorized("invalid or expired token")
	}

	// Store UID and Raw Token in Locals for handlers to use
	c.Locals("uid", token.UID)
	c.Locals("id_token", idToken)

	// Extract email_verified from claims
	if verified, ok := token.Claims["email_verified"].(bool); ok {
		c.Locals("email_verified", verified)
	} else {
		c.Locals("email_verified", false)
	}

	// Also set in UserContext if needed, mostly for value passing
	// But Fiber Locals is the standard way to pass request-scoped data.
	// We can also wrap the request context.
	ctx := context.WithValue(c.UserContext(), "uid", token.UID)
	c.SetUserContext(ctx)

	return c.Next()
}
