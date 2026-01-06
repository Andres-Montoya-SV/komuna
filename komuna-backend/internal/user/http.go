package user

import (
	"errors" // stdlib
	"net/mail"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	appErrors "komuna/internal/errors"
	"komuna/internal/firebase"
	"komuna/internal/logger"

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

func RegisterRoutes(
	r fiber.Router,
	dbPool *pgxpool.Pool,
) {
	users := r.Group("/users")

	users.Post("/register", registerHandler(dbPool))
	users.Post("/login", loginHandler(dbPool))
	users.Get("/", listUsersHandler(dbPool))
	users.Get("/:identifier", getUserHandler(dbPool))
}

func registerHandler(dbPool *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body registerRequest

		if err := c.BodyParser(&body); err != nil {
			return appErrors.BadRequest("invalid JSON body")
		}

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

		// 1. Crear usuario en Firebase Authentication
		displayName := body.FirstName + " " + body.LastName
		firebaseUser, err := firebase.CreateUser(ctx, body.Email, body.Password, displayName)
		if err != nil {
			// Log el error real para debugging
			logger.Log.Error(
				"firebase create user failed",
				zap.String("email", body.Email),
				zap.Error(err),
			)

			// Si el email ya existe en Firebase
			errStr := err.Error()
			if strings.Contains(errStr, "email already exists") ||
				strings.Contains(errStr, "EMAIL_EXISTS") ||
				strings.Contains(errStr, "already exists") {
				return appErrors.Conflict("email already exists")
			}

			// Retornar el error con más contexto
			return appErrors.Internal("failed to create user in Firebase: " + errStr)
		}

		// 2. Guardar datos adicionales en PostgreSQL usando Firebase UID como ID
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

		created, err := CreateUser(ctx, dbPool, userToCreate)
		if err != nil {
			// Log el error detallado para debugging
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
					// Si falla la inserción en PostgreSQL, eliminar el usuario de Firebase
					_ = firebase.DeleteUser(ctx, firebaseUser.UID)
					return appErrors.Conflict("email or username already exists")
				}
				// Si es otro error de PostgreSQL, incluir el mensaje
				_ = firebase.DeleteUser(ctx, firebaseUser.UID)
				return appErrors.Internal("failed to create user in database: " + pgErr.Message)
			}

			// Si falla la inserción en PostgreSQL, eliminar el usuario de Firebase
			_ = firebase.DeleteUser(ctx, firebaseUser.UID)
			return appErrors.Internal("failed to create user: " + err.Error())
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

func listUsersHandler(dbPool *pgxpool.Pool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		users, err := ListUsers(c.UserContext(), dbPool)
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

func getUserHandler(dbPool *pgxpool.Pool) fiber.Handler {
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
			u, err = GetUserByID(c.UserContext(), dbPool, identifier)
		} else if strings.Contains(identifier, "@") {
			u, err = GetUserByEmail(c.UserContext(), dbPool, strings.ToLower(identifier))
		} else {
			u, err = GetUserByUsername(c.UserContext(), dbPool, identifier)
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

func loginHandler(dbPool *pgxpool.Pool) fiber.Handler {
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

		// Determinar si es email o username
		var email string
		if strings.Contains(body.Identifier, "@") {
			email = body.Identifier
		} else {
			// Si es username, obtener el email desde PostgreSQL
			u, err := GetUserByUsername(ctx, dbPool, body.Identifier)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					return appErrors.Unauthorized("invalid credentials")
				}
				return appErrors.Internal("failed to login")
			}
			email = u.Email
		}

		// Autenticar con Firebase usando REST API
		signInResp, err := firebase.SignInWithEmailPassword(ctx, email, body.Password)
		if err != nil {
			// Log el error para debugging (pero no lo revelamos al usuario por seguridad)
			logger.Log.Warn(
				"firebase login failed",
				zap.String("email", email),
				zap.Error(err),
			)
			// Firebase retorna errores específicos, pero por seguridad no los revelamos
			return appErrors.Unauthorized("invalid credentials")
		}

		// Obtener datos adicionales del usuario desde PostgreSQL usando Firebase UID
		u, err := GetUserByID(ctx, dbPool, signInResp.LocalID)
		if err != nil {
			logger.Log.Error(
				"failed to get user data after firebase auth",
				zap.String("firebase_uid", signInResp.LocalID),
				zap.String("email", email),
				zap.Error(err),
			)
			if errors.Is(err, pgx.ErrNoRows) {
				// Usuario existe en Firebase pero no en PostgreSQL (caso edge)
				return appErrors.Internal("user data not found in database")
			}
			return appErrors.Internal("failed to get user data")
		}

		// Actualizar last_login_at
		now := time.Now().UTC()
		_, _ = dbPool.Exec(ctx, "UPDATE users SET last_login_at = $1 WHERE id = $2", now, u.ID)

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
