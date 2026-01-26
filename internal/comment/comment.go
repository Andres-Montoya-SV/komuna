package comment

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Comment struct {
	ID         string    `json:"id"`
	AuthorID   string    `json:"author_id"`
	TargetID   string    `json:"target_id"`
	TargetType string    `json:"target_type"` // product, review, post
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CreateCommentRequest struct {
	TargetID   string `json:"target_id" validate:"required"`
	TargetType string `json:"target_type" validate:"required"`
	Content    string `json:"content" validate:"required"`
}

type Repository interface {
	Create(ctx context.Context, c Comment) (Comment, error)
	List(ctx context.Context, targetID, targetType string) ([]Comment, error)
}

type postgresRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, c Comment) (Comment, error) {
	now := time.Now().UTC()
	query := `
		INSERT INTO comments (author_id, target_id, target_type, content, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		c.AuthorID, c.TargetID, c.TargetType, c.Content,
		now, now).
		Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return Comment{}, fmt.Errorf("failed to create comment: %w", err)
	}
	return c, nil
}

func (r *postgresRepository) List(ctx context.Context, targetID, targetType string) ([]Comment, error) {
	query := `
		SELECT id, author_id, target_id, target_type, content, created_at, updated_at
		FROM comments
		WHERE target_id = $1 AND target_type = $2
		ORDER BY created_at ASC
	`
	rows, err := r.db.Query(ctx, query, targetID, targetType)
	if err != nil {
		return nil, fmt.Errorf("failed to list comments: %w", err)
	}
	defer rows.Close()

	var comments []Comment
	for rows.Next() {
		var c Comment
		err := rows.Scan(&c.ID, &c.AuthorID, &c.TargetID, &c.TargetType, &c.Content, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan comment: %w", err)
		}
		comments = append(comments, c)
	}
	return comments, nil
}
