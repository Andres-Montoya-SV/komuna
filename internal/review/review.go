package review

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Review struct {
	ID         string    `json:"id"`
	AuthorID   string    `json:"author_id"`
	TargetID   string    `json:"target_id"`
	TargetType string    `json:"target_type"` // product, store, user
	Rating     int       `json:"rating"`
	Comment    string    `json:"comment"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CreateReviewRequest struct {
	TargetID   string `json:"target_id" validate:"required"`
	TargetType string `json:"target_type" validate:"required,oneof=product store user"`
	Rating     int    `json:"rating" validate:"required,min=1,max=5"`
	Comment    string `json:"comment"`
}

type Repository interface {
	Create(ctx context.Context, r Review) (Review, error)
	List(ctx context.Context, targetID, targetType string) ([]Review, error)
}

type postgresRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, rev Review) (Review, error) {
	now := time.Now().UTC()
	query := `
		INSERT INTO reviews (author_id, target_id, target_type, rating, comment, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		rev.AuthorID, rev.TargetID, rev.TargetType, rev.Rating, rev.Comment,
		now, now).
		Scan(&rev.ID, &rev.CreatedAt, &rev.UpdatedAt)
	if err != nil {
		return Review{}, fmt.Errorf("failed to create review: %w", err)
	}
	return rev, nil
}

func (r *postgresRepository) List(ctx context.Context, targetID, targetType string) ([]Review, error) {
	query := `
		SELECT id, author_id, target_id, target_type, rating, comment, created_at, updated_at
		FROM reviews
		WHERE target_id = $1 AND target_type = $2
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, targetID, targetType)
	if err != nil {
		return nil, fmt.Errorf("failed to list reviews: %w", err)
	}
	defer rows.Close()

	var reviews []Review
	for rows.Next() {
		var rev Review
		err := rows.Scan(&rev.ID, &rev.AuthorID, &rev.TargetID, &rev.TargetType, &rev.Rating, &rev.Comment, &rev.CreatedAt, &rev.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan review: %w", err)
		}
		reviews = append(reviews, rev)
	}
	return reviews, nil
}
