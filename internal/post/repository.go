package post

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, p Post) (Post, error)
	GetByID(ctx context.Context, id string) (Post, error)
	List(ctx context.Context, filters map[string]interface{}) ([]Post, error)
	Update(ctx context.Context, p Post) error
	Delete(ctx context.Context, id string) error
}

type postgresRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, p Post) (Post, error) {
	now := time.Now().UTC()
	query := `
		INSERT INTO posts (title, content, author_id, community_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at, is_deleted
	`
	err := r.db.QueryRow(ctx, query,
		p.Title, p.Content, p.AuthorID, p.CommunityID,
		now, now).
		Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt, &p.IsDeleted)
	if err != nil {
		return Post{}, fmt.Errorf("failed to create post: %w", err)
	}
	return p, nil
}

func (r *postgresRepository) GetByID(ctx context.Context, id string) (Post, error) {
	query := `
		SELECT id, title, content, author_id, community_id, created_at, updated_at, is_deleted, deleted_at
		FROM posts
		WHERE id = $1 AND is_deleted = FALSE
	`
	var p Post
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.ID, &p.Title, &p.Content, &p.AuthorID, &p.CommunityID,
			&p.CreatedAt, &p.UpdatedAt, &p.IsDeleted, &p.DeletedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return Post{}, fmt.Errorf("post not found")
		}
		return Post{}, fmt.Errorf("failed to get post: %w", err)
	}
	return p, nil
}

func (r *postgresRepository) List(ctx context.Context, filters map[string]interface{}) ([]Post, error) {
	query := `
		SELECT id, title, content, author_id, community_id, created_at, updated_at, is_deleted, deleted_at
		FROM posts
		WHERE is_deleted = FALSE
	`
	var args []interface{}

	if val, ok := filters["community_id"]; ok && val != "" {
		query += fmt.Sprintf(" AND community_id = $%d", len(args)+1)
		args = append(args, val)
	}
	if val, ok := filters["author_id"]; ok && val != "" {
		query += fmt.Sprintf(" AND author_id = $%d", len(args)+1)
		args = append(args, val)
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list posts: %w", err)
	}
	defer rows.Close()

	var posts []Post
	for rows.Next() {
		var p Post
		err := rows.Scan(&p.ID, &p.Title, &p.Content, &p.AuthorID, &p.CommunityID,
			&p.CreatedAt, &p.UpdatedAt, &p.IsDeleted, &p.DeletedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan post: %w", err)
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func (r *postgresRepository) Update(ctx context.Context, p Post) error {
	query := `
		UPDATE posts
		SET title = $1, content = $2, updated_at = $3
		WHERE id = $4 AND is_deleted = FALSE
	`
	_, err := r.db.Exec(ctx, query,
		p.Title, p.Content, time.Now().UTC(), p.ID)
	if err != nil {
		return fmt.Errorf("failed to update post: %w", err)
	}
	return nil
}

func (r *postgresRepository) Delete(ctx context.Context, id string) error {
	query := `
		UPDATE posts
		SET is_deleted = TRUE, deleted_at = $1
		WHERE id = $2 AND is_deleted = FALSE
	`
	_, err := r.db.Exec(ctx, query, time.Now().UTC(), id)
	if err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}
	return nil
}
