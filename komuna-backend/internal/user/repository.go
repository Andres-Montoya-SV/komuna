package user

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CreateUser inserta un nuevo usuario en la base de datos.
// Asume la existencia de una tabla "users" con columnas compatibles.
func CreateUser(ctx context.Context, dbPool *pgxpool.Pool, u User) (User, error) {
	now := time.Now().UTC()

	// Generar ID si no viene seteado
	if u.ID == "" {
		u.ID = uuid.NewString()
	}

	// Valor por defecto para status
	if u.Status == "" {
		u.Status = "pending" // pending | active | disabled, etc.
	}

	const query = `
		INSERT INTO users (
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			password_hash,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, $10, NULL)
		RETURNING
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			password_hash,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
	`

	row := dbPool.QueryRow(
		ctx,
		query,
		u.ID,
		u.FirstName,
		u.LastName,
		u.Username,
		u.Phone,
		u.Email,
		u.PasswordHash,
		u.Status,
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
		&created.PasswordHash,
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

// GetUserByID obtiene un usuario por su ID (UUID) si no está marcado como eliminado.
func GetUserByID(ctx context.Context, dbPool *pgxpool.Pool, id string) (User, error) {
	const query = `
		SELECT
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			password_hash,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		FROM users
		WHERE id = $1 AND is_deleted = FALSE
	`

	row := dbPool.QueryRow(ctx, query, id)

	var u User
	if err := row.Scan(
		&u.ID,
		&u.FirstName,
		&u.LastName,
		&u.Username,
		&u.Phone,
		&u.Email,
		&u.PasswordHash,
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

// GetUserByEmail obtiene un usuario por su email si no está marcado como eliminado.
func GetUserByEmail(ctx context.Context, dbPool *pgxpool.Pool, email string) (User, error) {
	const query = `
		SELECT
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			password_hash,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		FROM users
		WHERE email = $1 AND is_deleted = FALSE
	`

	row := dbPool.QueryRow(ctx, query, email)

	var u User
	if err := row.Scan(
		&u.ID,
		&u.FirstName,
		&u.LastName,
		&u.Username,
		&u.Phone,
		&u.Email,
		&u.PasswordHash,
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

// GetUserByUsername obtiene un usuario por su username si no está marcado como eliminado.
func GetUserByUsername(ctx context.Context, dbPool *pgxpool.Pool, username string) (User, error) {
	const query = `
		SELECT
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			password_hash,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		FROM users
		WHERE username = $1 AND is_deleted = FALSE
	`

	row := dbPool.QueryRow(ctx, query, username)

	var u User
	if err := row.Scan(
		&u.ID,
		&u.FirstName,
		&u.LastName,
		&u.Username,
		&u.Phone,
		&u.Email,
		&u.PasswordHash,
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

// ListUsers devuelve todos los usuarios no eliminados, ordenados por fecha de creación descendente.
func ListUsers(ctx context.Context, dbPool *pgxpool.Pool) ([]User, error) {
	const query = `
		SELECT
			id,
			first_name,
			last_name,
			username,
			phone,
			email,
			password_hash,
			status,
			email_verified,
			created_at,
			updated_at,
			last_login_at
		FROM users
		WHERE is_deleted = FALSE
		ORDER BY created_at DESC
	`

	rows, err := dbPool.Query(ctx, query)
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
			&u.PasswordHash,
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

