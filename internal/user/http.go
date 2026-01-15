package user

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	appErrors "komuna/internal/errors"
	"komuna/internal/firebase"
	"komuna/internal/logger"
	"komuna/internal/middleware"

	"go.uber.org/zap"
)

type registerRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

type loginRequest struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

// RegisterRoutes registers the user routes.
// RegisterRoutes registers the user routes.
func RegisterRoutes(r fiber.Router, repo Repository) {
	users := r.Group("/users")

	// Public routes
	users.Post("/register", registerHandler(repo))
	users.Post("/login", loginHandler(repo))

	// Protected routes
	users.Get("/me", middleware.AuthRequired, getMeHandler(repo))
	users.Post("/verify-email", middleware.AuthRequired, resendVerificationHandler())

	// Tools / Debug routes (Directly on v1, not /users prefix)
	r.Get("/tools/debug/endpoint", middleware.AuthRequired, getFirebaseDebugHandler())

	// Public (or maybe protected? keeping public for now as per previous code)
	users.Get("/", listUsersHandler(repo))
	users.Get("/:identifier", getUserHandler(repo))
}

func registerHandler(repo Repository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body registerRequest

		if err := c.BodyParser(&body); err != nil {
			return appErrors.BadRequest("invalid JSON body")
		}

		// Log the incoming register request (Masking password)
		safeBody := fiber.Map{
			"first_name": body.FirstName,
			"last_name":  body.LastName,
			"username":   body.Username,
			"phone":      body.Phone,
			"email":      body.Email,
			"password":   "[MASKED]",
		}
		logger.Log.Info("Register Request Received",
			zap.Any("payload", safeBody),
			zap.String("method", c.Method()),
			zap.String("path", c.Path()),
			zap.String("explanation", "New user verification and creation attempt"),
		)

		body.FirstName = strings.TrimSpace(body.FirstName)
		body.LastName = strings.TrimSpace(body.LastName)
		body.Username = strings.TrimSpace(body.Username)
		body.Phone = strings.TrimSpace(body.Phone)
		body.Email = strings.TrimSpace(strings.ToLower(body.Email))

		if body.FirstName == "" || body.LastName == "" {
			return appErrors.BadRequest("first_name and last_name are required")
		}

		if body.Username == "" {
			return appErrors.BadRequest("username is required")
		}

		if body.Email == "" {
			return appErrors.BadRequest("email is required")
		}

		if _, err := mail.ParseAddress(body.Email); err != nil {
			return appErrors.BadRequest("email is not valid")
		}

		if len(body.Password) < 8 {
			return appErrors.BadRequest("password must be at least 8 characters")
		}

		ctx := c.UserContext()

		// 1. Create user in Firebase Authentication
		displayName := body.FirstName + " " + body.LastName
		firebaseUser, err := firebase.CreateUser(ctx, body.Email, body.Password, displayName)
		if err != nil {
			// Log real error for debugging
			logger.Log.Error(
				"firebase create user failed",
				zap.String("email", body.Email),
				zap.Error(err),
			)

			// If email already exists in Firebase
			errStr := err.Error()
			if strings.Contains(errStr, "email already exists") ||
				strings.Contains(errStr, "EMAIL_EXISTS") ||
				strings.Contains(errStr, "already exists") {
				return appErrors.Conflict("email already exists")
			}

			// Return error with more context
			return appErrors.Internal("failed to create user in Firebase: " + errStr)
		}

		// 2. Save additional data in PostgreSQL using Firebase UID as ID
		userToCreate := User{
			ID:            firebaseUser.UID,
			FirstName:     body.FirstName,
			LastName:      body.LastName,
			Username:      body.Username,
			Phone:         body.Phone,
			Email:         body.Email,
			Status:        "pending",
			EmailVerified: firebaseUser.EmailVerified,
		}

		created, err := repo.CreateUser(ctx, userToCreate)
		if err != nil {
			// Log detailed error for debugging
			logger.Log.Error(
				"postgres create user failed",
				zap.String("firebase_uid", firebaseUser.UID),
				zap.String("email", body.Email),
				zap.String("username", body.Username),
				zap.Error(err),
			)

			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) {
				if pgErr.Code == "23505" {
					// If Postgres insertion fails, delete user from Firebase
					_ = firebase.DeleteUser(ctx, firebaseUser.UID)
					return appErrors.Conflict("email or username already exists")
				}
				// If other Postgres error, include message
				_ = firebase.DeleteUser(ctx, firebaseUser.UID)
				return appErrors.Internal("failed to create user in database: " + pgErr.Message)
			}

			// If Postgres insertion fails, delete user from Firebase
			_ = firebase.DeleteUser(ctx, firebaseUser.UID)
			return appErrors.Internal("failed to create user: " + err.Error())
		}

		// 3. Send Verification Email (Best Effort)
		// We need an ID token to send the verification email.
		signInResp, err := firebase.SignInWithEmailPassword(ctx, body.Email, body.Password)
		if err == nil {
			if err := firebase.SendVerificationEmail(ctx, signInResp.IDToken); err != nil {
				// Log warning but don't fail registration
				logger.Log.Warn(
					"failed to send verification email",
					zap.String("email", body.Email),
					zap.Error(err),
				)
			}
		} else {
			// Log warning if auto-login fails
			logger.Log.Warn(
				"failed to auto-login for verification email",
				zap.String("email", body.Email),
				zap.Error(err),
			)
		}

		response := fiber.Map{
			"id":             created.ID,
			"first_name":     created.FirstName,
			"last_name":      created.LastName,
			"username":       created.Username,
			"phone":          created.Phone,
			"email":          created.Email,
			"status":         created.Status,
			"email_verified": created.EmailVerified,
			"created_at":     created.CreatedAt,
			"updated_at":     created.UpdatedAt,
		}

		return c.Status(fiber.StatusCreated).JSON(response)
	}
}

func listUsersHandler(repo Repository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		users, err := repo.ListUsers(c.UserContext())
		if err != nil {
			return appErrors.Internal("failed to list users")
		}

		response := make([]fiber.Map, 0, len(users))
		for _, u := range users {
			response = append(response, fiber.Map{
				"id":             u.ID,
				"first_name":     u.FirstName,
				"last_name":      u.LastName,
				"username":       u.Username,
				"phone":          u.Phone,
				"email":          u.Email,
				"status":         u.Status,
				"email_verified": u.EmailVerified,
				"created_at":     u.CreatedAt,
				"updated_at":     u.UpdatedAt,
			})
		}

		return c.JSON(response)
	}
}

func getUserHandler(repo Repository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		identifier := strings.TrimSpace(c.Params("identifier"))
		if identifier == "" {
			return appErrors.BadRequest("identifier is required")
		}

		var (
			u   User
			err error
		)

		if _, parseErr := uuid.Parse(identifier); parseErr == nil {
			u, err = repo.GetUserByID(c.UserContext(), identifier)
		} else if strings.Contains(identifier, "@") {
			u, err = repo.GetUserByEmail(c.UserContext(), strings.ToLower(identifier))
		} else {
			u, err = repo.GetUserByUsername(c.UserContext(), identifier)
		}

		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return appErrors.NotFound("user not found")
			}
			return appErrors.Internal("failed to get user")
		}

		response := fiber.Map{
			"id":             u.ID,
			"first_name":     u.FirstName,
			"last_name":      u.LastName,
			"username":       u.Username,
			"phone":          u.Phone,
			"email":          u.Email,
			"status":         u.Status,
			"email_verified": u.EmailVerified,
			"created_at":     u.CreatedAt,
			"updated_at":     u.UpdatedAt,
		}

		return c.JSON(response)
	}
}

// Helper to sync user state with Firebase (Source of Truth)
func syncUserWithFirebase(ctx context.Context, repo Repository, u User, firebaseEmail string, firebaseVerified bool) (User, error) {
	updated := false

	// Compare Email (if changed in Firebase)
	if firebaseEmail != "" && u.Email != firebaseEmail {
		u.Email = firebaseEmail
		updated = true
	}

	// Compare Verified Status
	if u.EmailVerified != firebaseVerified {
		u.EmailVerified = firebaseVerified
		updated = true
	}

	// Enforce Active status if Verified (regardless of whether it just changed or was already true)
	if firebaseVerified && u.Status != "active" {
		u.Status = "active"
		updated = true
	}

	// If there were changes, persist them
	if updated {
		if err := repo.UpdateUser(ctx, u); err != nil {
			return u, err
		}
	}

	return u, nil
}

func loginHandler(repo Repository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body loginRequest

		if err := c.BodyParser(&body); err != nil {
			return appErrors.BadRequest("invalid JSON body")
		}

		body.Identifier = strings.TrimSpace(strings.ToLower(body.Identifier))

		if body.Identifier == "" || body.Password == "" {
			return appErrors.BadRequest("identifier and password are required")
		}

		ctx := c.UserContext()

		// Determine if it's email or username
		var email string
		if strings.Contains(body.Identifier, "@") {
			email = body.Identifier
		} else {
			// If username, get email from PostgreSQL
			u, err := repo.GetUserByUsername(ctx, body.Identifier)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					return appErrors.Unauthorized("invalid credentials")
				}
				return appErrors.Internal("failed to login")
			}
			email = u.Email
		}

		// Authenticate with Firebase using REST API
		signInResp, err := firebase.SignInWithEmailPassword(ctx, email, body.Password)
		if err != nil {
			logger.Log.Warn(
				"firebase login failed",
				zap.String("email", email),
				zap.Error(err),
			)
			return appErrors.Unauthorized("invalid credentials")
		}

		// Verify the token immediately to get the authoritative email_verified status
		// The REST API response body is sometimes unreliable for this field.
		token, err := firebase.VerifyToken(ctx, signInResp.IDToken)
		if err != nil {
			logger.Log.Error("failed to verify token after login", zap.Error(err))
			return appErrors.Internal("failed to process login")
		}

		// Extract verified status from claims
		emailVerified := false
		if v, ok := token.Claims["email_verified"].(bool); ok {
			emailVerified = v
		}

		// Enforce Email Verification
		if !emailVerified {
			logger.Log.Warn("login attempt with unverified email", zap.String("email", email))
			return appErrors.Forbidden("email not verified. please check your inbox")
		}

		// Get user data from PostgreSQL using Firebase UID
		u, err := repo.GetUserByID(ctx, signInResp.LocalID)
		if err != nil {
			// ... (error handling remains same)
			if errors.Is(err, pgx.ErrNoRows) {
				return appErrors.Internal("user data not found in database")
			}
			return appErrors.Internal("failed to get user data")
		}

		// SYNC with Firebase
		u, err = syncUserWithFirebase(ctx, repo, u, signInResp.Email, emailVerified)
		if err != nil {
			logger.Log.Error("failed to sync user with firebase on login", zap.Error(err))
		}

		// Update last_login_at
		_ = repo.UpdateLastLogin(ctx, u.ID)

		// Log successful login
		logger.Log.Info("Login Successful",
			zap.String("user_id", u.ID),
			zap.String("email", u.Email),
			zap.String("status", u.Status),
			zap.Bool("email_verified", u.EmailVerified),
			zap.String("explanation", "User authenticated with Firebase and synced with PostgreSQL"),
		)

		return c.JSON(fiber.Map{
			"id_token":      signInResp.IDToken,
			"refresh_token": signInResp.RefreshToken,
			"token_type":    "Bearer",
			"expires_in":    signInResp.ExpiresIn,
			"user": fiber.Map{
				"id":             u.ID,
				"username":       u.Username,
				"email":          u.Email,
				"status":         u.Status,
				"email_verified": u.EmailVerified,
			},
		})
	}
}

func getMeHandler(repo Repository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		uid, ok := c.Locals("uid").(string)
		if !ok || uid == "" {
			return appErrors.Unauthorized("unauthorized")
		}

		u, err := repo.GetUserByID(c.UserContext(), uid)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return appErrors.NotFound("user not found")
			}
			return appErrors.Internal("failed to get user profile")
		}

		// SYNC with Firebase from Token Claims
		// Middleware extracts claims to locals
		firebaseVerified, _ := c.Locals("email_verified").(bool)
		// Usually token doesn't have email unless we parse it.
		// For simplicity, let's only sync Verified status from Token,
		// unless we decode more claims like 'email'.
		// Re-verifying token just for email is expensive.
		// Let's assume email matches or sync primarily on Verified.
		// If we want email sync here, we need to extract 'email' from token claims in middleware.

		// Let's implement partial sync here (Verified only) or trust what we have.
		// For robustness, let's sync verified status.
		u, err = syncUserWithFirebase(c.UserContext(), repo, u, "", firebaseVerified)
		if err != nil {
			logger.Log.Error("failed to sync user with firebase on getMe", zap.Error(err))
		}

		// Update last_login_at
		_ = repo.UpdateLastLogin(c.UserContext(), u.ID)

		return c.JSON(fiber.Map{
			"id":             u.ID,
			"first_name":     u.FirstName,
			"last_name":      u.LastName,
			"username":       u.Username,
			"phone":          u.Phone,
			"email":          u.Email,
			"status":         u.Status,
			"email_verified": u.EmailVerified,
			"created_at":     u.CreatedAt,
			"updated_at":     u.UpdatedAt,
		})
	}
}

func resendVerificationHandler() fiber.Handler {
	return func(c *fiber.Ctx) error {
		idToken, ok := c.Locals("id_token").(string)
		if !ok || idToken == "" {
			return appErrors.Unauthorized("unauthorized")
		}

		ctx := c.UserContext()

		if err := firebase.SendVerificationEmail(ctx, idToken); err != nil {
			logger.Log.Error("failed to resend verification email", zap.Error(err))
			return appErrors.Internal("failed to send verification email")
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "verification email sent",
		})
	}
}

func getFirebaseDebugHandler() fiber.Handler {
	return func(c *fiber.Ctx) error {
		uid, ok := c.Locals("uid").(string)
		if !ok || uid == "" {
			return appErrors.Unauthorized("unauthorized")
		}

		logger.Log.Info("Debugging Firebase User Fetch",
			zap.String("uid_raw", uid),
			zap.String("uid_quoted", fmt.Sprintf("%q", uid)),
		)

		fbUser, err := firebase.GetUser(c.Context(), uid)
		if err != nil {
			logger.Log.Error("failed to get firebase user debug info", zap.Error(err))
			return appErrors.Internal("failed to retrieve firebase info")
		}

		return c.Status(fiber.StatusOK).JSON(fbUser)
	}
}
