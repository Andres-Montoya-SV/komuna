package user

import (
	"errors" // stdlib
	"komuna/internal/auth"
	"net/mail"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	appErrors "komuna/internal/errors"
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
	Identifier string `json:"identifier"` // Puede ser email o username
	Password   string `json:"password"`
}

func RegisterRoutes(
	r fiber.Router,
	dbPool *pgxpool.Pool,
	authCfg auth.Config,
) {
	users := r.Group("/users")

	users.Post("/register", registerHandler(dbPool))
	users.Post("/login", loginHandler(dbPool, authCfg))
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

		hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
		if err != nil {
			return appErrors.Internal("failed to hash password")
		}

		userToCreate := User{
			FirstName:    body.FirstName,
			LastName:     body.LastName,
			Username:     body.Username,
			Phone:        body.Phone,
			Email:        body.Email,
			PasswordHash: string(hash),
			Status:       "pending",
		}

		created, err := CreateUser(c.UserContext(), dbPool, userToCreate)
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) {
				if pgErr.Code == "23505" {
					return appErrors.Conflict("email or username already exists")
				}
			}

			return appErrors.Internal("failed to create user")
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

// listUsersHandler devuelve todos los usuarios no eliminados.
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

func loginHandler(dbPool *pgxpool.Pool, authCfg auth.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body loginRequest

		if err := c.BodyParser(&body); err != nil {
			return appErrors.BadRequest("invalid JSON body")
		}

		body.Identifier = strings.TrimSpace(strings.ToLower(body.Identifier))

		if body.Identifier == "" || body.Password == "" {
			return appErrors.BadRequest("identifier and password are required")
		}

		var (
			u   User
			err error
		)

		if strings.Contains(body.Identifier, "@") {
			u, err = GetUserByEmail(c.UserContext(), dbPool, body.Identifier)
		} else {
			u, err = GetUserByUsername(c.UserContext(), dbPool, body.Identifier)
		}

		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return appErrors.Unauthorized("invalid credentials")
			}
			return appErrors.Internal("failed to login")
		}

		if err := bcrypt.CompareHashAndPassword(
			[]byte(u.PasswordHash),
			[]byte(body.Password),
		); err != nil {
			return appErrors.Unauthorized("invalid credentials")
		}

		token, err := auth.GenerateAccessToken(
			authCfg,
			u.ID,
			u.Username,
			u.EmailVerified,
		)
		if err != nil {
			return appErrors.Internal("failed to generate token")
		}

		return c.JSON(fiber.Map{
			"access_token": token,
			"token_type":   "Bearer",
			"expires_in":   int(authCfg.AccessExpiry.Seconds()),
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
