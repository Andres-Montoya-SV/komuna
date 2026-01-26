package community

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, c Community) (Community, error)
	GetByID(ctx context.Context, id string) (Community, error)
	List(ctx context.Context) ([]Community, error)
	Update(ctx context.Context, c Community) error
	Delete(ctx context.Context, id string) error
}

type postgresRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, c Community) (Community, error) {
	now := time.Now().UTC()
	query := `
		INSERT INTO communities (name, description, owner_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query, c.Name, c.Description, c.OwnerID, now, now).
		Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return Community{}, fmt.Errorf("failed to create community: %w", err)
	}
	return c, nil
}

func (r *postgresRepository) GetByID(ctx context.Context, id string) (Community, error) {
	query := `
		SELECT id, name, description, owner_id, created_at, updated_at
		FROM communities
		WHERE id = $1
	`
	var c Community
	err := r.db.QueryRow(ctx, query, id).
		Scan(&c.ID, &c.Name, &c.Description, &c.OwnerID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return Community{}, fmt.Errorf("failed to get community: %w", err)
	}
	return c, nil
}

func (r *postgresRepository) List(ctx context.Context) ([]Community, error) {
	query := `
		SELECT id, name, description, owner_id, created_at, updated_at
		FROM communities
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list communities: %w", err)
	}
	defer rows.Close()

	var communities []Community
	for rows.Next() {
		var c Community
		if err := rows.Scan(&c.ID, &c.Name, &c.Description, &c.OwnerID, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan community: %w", err)
		}
		communities = append(communities, c)
	}
	return communities, nil
}

func (r *postgresRepository) Update(ctx context.Context, c Community) error {
	query := `
		UPDATE communities
		SET name = $1, description = $2, updated_at = $3
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query, c.Name, c.Description, time.Now().UTC(), c.ID)
	if err != nil {
		return fmt.Errorf("failed to update community: %w", err)
	}
	return nil
}

func (r *postgresRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM communities WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete community: %w", err)
	}
	return nil
}
