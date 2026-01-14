package user

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository defines the interface for user persistence operations.
type Repository interface {
	CreateUser(ctx context.Context, u User) (User, error)
	GetUserByID(ctx context.Context, id string) (User, error)
	GetUserByEmail(ctx context.Context, email string) (User, error)
	GetUserByUsername(ctx context.Context, username string) (User, error)
	ListUsers(ctx context.Context) ([]User, error)
	UpdateLastLogin(ctx context.Context, id string) error
	UpdateEmailVerified(ctx context.Context, id string, verified bool) error
	UpdateUser(ctx context.Context, u User) error
}

type postgresRepository struct {
	db *pgxpool.Pool
}

// NewRepository creates a new postgres user repository.
func NewRepository(db *pgxpool.Pool) Repository {
	return &postgresRepository{db: db}
}

// CreateUser inserts a new user into the database.
// It relies on the ID being provided (Firebase UID).
func (r *postgresRepository) CreateUser(ctx context.Context, u User) (User, error) {
	now := time.Now().UTC()

	// ID must be provided (Firebase UID)
	if u.ID == "" {
		return User{}, fmt.Errorf("user ID (Firebase UID) is required")
	}

	const query = `
		INSERT INTO users (
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7::user_status, $8, $9, $10, NULL)
		RETURNING
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
	`

	row := r.db.QueryRow(
		ctx,
		query,
		u.ID,
		u.FirstName,
		u.LastName,
		u.Username,
		u.Phone,
		u.Email,
		u.Status,
		u.EmailVerified,
		now,
		now,
	)

	var created User

	if err := row.Scan(
		&created.ID,
		&created.FirstName,
		&created.LastName,
		&created.Username,
		&created.Phone,
		&created.Email,
		&created.Status,
		&created.EmailVerified,
		&created.CreatedAt,
		&created.UpdatedAt,
		&created.LastLoginAt,
	); err != nil {
		return User{}, err
	}

	return created, nil
}

// GetUserByID retrieves a user by their ID (UUID) if not marked as deleted.
func (r *postgresRepository) GetUserByID(ctx context.Context, id string) (User, error) {
	const query = `
		SELECT
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		FROM users
		WHERE id = $1 AND is_deleted = FALSE
	`

	row := r.db.QueryRow(ctx, query, id)

	var u User
	if err := row.Scan(
		&u.ID,
		&u.FirstName,
		&u.LastName,
		&u.Username,
		&u.Phone,
		&u.Email,
		&u.Status,
		&u.EmailVerified,
		&u.CreatedAt,
		&u.UpdatedAt,
		&u.LastLoginAt,
	); err != nil {
		return User{}, err
	}

	return u, nil
}

// GetUserByEmail retrieves a user by their email if not marked as deleted.
func (r *postgresRepository) GetUserByEmail(ctx context.Context, email string) (User, error) {
	const query = `
		SELECT
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		FROM users
		WHERE email = $1 AND is_deleted = FALSE
	`

	row := r.db.QueryRow(ctx, query, email)

	var u User
	if err := row.Scan(
		&u.ID,
		&u.FirstName,
		&u.LastName,
		&u.Username,
		&u.Phone,
		&u.Email,
		&u.Status,
		&u.EmailVerified,
		&u.CreatedAt,
		&u.UpdatedAt,
		&u.LastLoginAt,
	); err != nil {
		return User{}, err
	}

	return u, nil
}

// GetUserByUsername retrieves a user by their username if not marked as deleted.
func (r *postgresRepository) GetUserByUsername(ctx context.Context, username string) (User, error) {
	const query = `
		SELECT
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		FROM users
		WHERE username = $1 AND is_deleted = FALSE
	`

	row := r.db.QueryRow(ctx, query, username)

	var u User
	if err := row.Scan(
		&u.ID,
		&u.FirstName,
		&u.LastName,
		&u.Username,
		&u.Phone,
		&u.Email,
		&u.Status,
		&u.EmailVerified,
		&u.CreatedAt,
		&u.UpdatedAt,
		&u.LastLoginAt,
	); err != nil {
		return User{}, err
	}

	return u, nil
}

// ListUsers returns all non-deleted users, ordered by creation date descending.
func (r *postgresRepository) ListUsers(ctx context.Context) ([]User, error) {
	const query = `
		SELECT
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		FROM users
		WHERE is_deleted = FALSE
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User

	for rows.Next() {
		var u User
		if err := rows.Scan(
			&u.ID,
			&u.FirstName,
			&u.LastName,
			&u.Username,
			&u.Phone,
			&u.Email,
			&u.Status,
			&u.EmailVerified,
			&u.CreatedAt,
			&u.UpdatedAt,
			&u.LastLoginAt,
		); err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// UpdateLastLogin updates the last_login_at timestamp for a user.
func (r *postgresRepository) UpdateLastLogin(ctx context.Context, id string) error {
	now := time.Now().UTC()
	_, err := r.db.Exec(ctx, "UPDATE users SET last_login_at = $1 WHERE id = $2", now, id)
	return err
}

// UpdateEmailVerified updates the email_verified status and sets status to active if verified.
func (r *postgresRepository) UpdateEmailVerified(ctx context.Context, id string, verified bool) error {
	now := time.Now().UTC()
	var status string
	if verified {
		status = "active"
	} else {
		status = "pending"
	}

	query := `
		UPDATE users 
		SET email_verified = $1, status = $2::user_status, updated_at = $3 
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query, verified, status, now, id)
	return err
}

// UpdateUser updates generic user fields (email, status, etc).
func (r *postgresRepository) UpdateUser(ctx context.Context, u User) error {
	const query = `
		UPDATE users
		SET
			first_name = $2,
			last_name = $3,
			username = $4,
			phone = $5,
			email = $6,
			status = $7::user_status,
			email_verified = $8,
			updated_at = $9
		WHERE id = $1
	`
	_, err := r.db.Exec(
		ctx,
		query,
		u.ID,
		u.FirstName,
		u.LastName,
		u.Username,
		u.Phone,
		u.Email,
		u.Status,
		u.EmailVerified,
		time.Now().UTC(),
	)
	return err
}
