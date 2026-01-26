package store

import "time"

type Store struct {
	ID          string      `json:"id"`
	OwnerID     string      `json:"owner_id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Location    string      `json:"location"`
	Phone       string      `json:"phone"`
	Email       string      `json:"email"`
	SocialLinks SocialLinks `json:"social_links"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}
type CreateStoreRequest struct {
	Name        string      `json:"name" validate:"required"`
	Description string      `json:"description"`
	Location    string      `json:"location"`
	Phone       string      `json:"phone"`
	Email       string      `json:"email" validate:"required,email"`
	SocialLinks SocialLinks `json:"social_links"`
}

type UpdateStoreRequest struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Location    string      `json:"location"`
	Phone       string      `json:"phone"`
	Email       string      `json:"email" validate:"email"`
	SocialLinks SocialLinks `json:"social_links"`
}
type SocialLinks map[string]string
