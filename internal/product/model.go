package product

import "time"

type Product struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Price         float64   `json:"price"`
	Quality       string    `json:"quality"`        // New: Condition (New, Used, etc)
	StockQuantity int       `json:"stock_quantity"` // New: Stack on unit
	CommunityID   *string   `json:"community_id"`   // Nullable now
	SellerID      string    `json:"seller_id"`
	StoreID       *string   `json:"store_id"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreateProductRequest struct {
	Name          string  `json:"name" validate:"required"`
	Description   string  `json:"description"`
	Price         float64 `json:"price" validate:"required,min=0"`
	Quality       string  `json:"quality"`
	StockQuantity int     `json:"stock_quantity" validate:"min=0"`
	CommunityID   string  `json:"community_id"` // Optional
	StoreID       string  `json:"store_id"`     // Optional
}
