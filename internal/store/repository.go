package store

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	// Store methods
	CreateStore(ctx context.Context, s Store) (Store, error)
	GetStoreByID(ctx context.Context, id string) (Store, error)
	GetStoreByOwnerID(ctx context.Context, ownerID string) (Store, error)
	UpdateStore(ctx context.Context, s Store) error
}

type postgresRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) CreateStore(ctx context.Context, s Store) (Store, error) {
	now := time.Now().UTC()
	query := `
		INSERT INTO stores (owner_id, name, description, location, phone, email, social_links, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query, s.OwnerID, s.Name, s.Description, s.Location, s.Phone, s.Email, s.SocialLinks, now, now).
		Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return Store{}, fmt.Errorf("failed to create store: %w", err)
	}
	return s, nil
}

func (r *postgresRepository) GetStoreByID(ctx context.Context, id string) (Store, error) {
	query := `
		SELECT id, owner_id, name, description, location, phone, email, social_links, created_at, updated_at
		FROM stores
		WHERE id = $1
	`
	var s Store
	err := r.db.QueryRow(ctx, query, id).
		Scan(&s.ID, &s.OwnerID, &s.Name, &s.Description, &s.Location, &s.Phone, &s.Email, &s.SocialLinks, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return Store{}, fmt.Errorf("failed to get store: %w", err)
	}
	return s, nil
}

func (r *postgresRepository) GetStoreByOwnerID(ctx context.Context, ownerID string) (Store, error) {
	query := `
		SELECT id, owner_id, name, description, location, phone, email, social_links, created_at, updated_at
		FROM stores
		WHERE owner_id = $1
	`
	var s Store
	err := r.db.QueryRow(ctx, query, ownerID).
		Scan(&s.ID, &s.OwnerID, &s.Name, &s.Description, &s.Location, &s.Phone, &s.Email, &s.SocialLinks, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return Store{}, fmt.Errorf("failed to get store by owner: %w", err)
	}
	return s, nil
}

func (r *postgresRepository) UpdateStore(ctx context.Context, s Store) error {
	query := `
		UPDATE stores
		SET name = $1, description = $2, location = $3, phone = $4, email = $5, social_links = $6, updated_at = $7
		WHERE id = $8
	`
	_, err := r.db.Exec(ctx, query, s.Name, s.Description, s.Location, s.Phone, s.Email, s.SocialLinks, time.Now().UTC(), s.ID)
	if err != nil {
		return fmt.Errorf("failed to update store: %w", err)
	}
	return nil
}
