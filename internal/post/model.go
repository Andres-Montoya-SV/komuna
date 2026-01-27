package post

import "time"

type Post struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Content     string     `json:"content"`
	AuthorID    string     `json:"author_id"`
	CommunityID *string    `json:"community_id,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	IsDeleted   bool       `json:"is_deleted"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type CreatePostRequest struct {
	Title       string `json:"title" validate:"required,min=1,max=255"`
	Content     string `json:"content" validate:"required,min=1"`
	CommunityID string `json:"community_id"` // Optional
}

type UpdatePostRequest struct {
	Title   string `json:"title" validate:"required,min=1,max=255"`
	Content string `json:"content" validate:"required,min=1"`
}
