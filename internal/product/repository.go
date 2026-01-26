package product

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, p Product) (Product, error)
	GetByID(ctx context.Context, id string) (Product, error)
	List(ctx context.Context, filters map[string]interface{}) ([]Product, error)
	Update(ctx context.Context, p Product) error
}

type postgresRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, p Product) (Product, error) {
	now := time.Now().UTC()
	query := `
		INSERT INTO products (name, description, price, quality, stock_quantity, community_id, seller_id, store_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		p.Name, p.Description, p.Price, p.Quality, p.StockQuantity,
		p.CommunityID, p.SellerID, p.StoreID,
		now, now).
		Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return Product{}, fmt.Errorf("failed to create product: %w", err)
	}
	return p, nil
}

func (r *postgresRepository) GetByID(ctx context.Context, id string) (Product, error) {
	query := `
		SELECT id, name, description, price, quality, stock_quantity, community_id, seller_id, store_id, created_at, updated_at
		FROM products
		WHERE id = $1
	`
	var p Product
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Quality, &p.StockQuantity,
			&p.CommunityID, &p.SellerID, &p.StoreID,
			&p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return Product{}, fmt.Errorf("failed to get product: %w", err)
	}
	return p, nil
}

func (r *postgresRepository) List(ctx context.Context, filters map[string]interface{}) ([]Product, error) {
	// Base query
	query := `
		SELECT id, name, description, price, quality, stock_quantity, community_id, seller_id, store_id, created_at, updated_at
		FROM products
		WHERE 1=1
	`
	var args []interface{}
	// argCount removed; args slice length used directly
	if val, ok := filters["community_id"]; ok && val != "" {
		query += fmt.Sprintf(" AND community_id = $%d", len(args)+1)
		args = append(args, val)
	}
	if val, ok := filters["store_id"]; ok && val != "" {
		query += fmt.Sprintf(" AND store_id = $%d", len(args)+1)
		args = append(args, val)
	}
	if val, ok := filters["seller_id"]; ok && val != "" {
		query += fmt.Sprintf(" AND seller_id = $%d", len(args)+1)
		args = append(args, val)
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list products: %w", err)
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Quality, &p.StockQuantity,
			&p.CommunityID, &p.SellerID, &p.StoreID,
			&p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		products = append(products, p)
	}
	return products, nil
}

func (r *postgresRepository) Update(ctx context.Context, p Product) error {
	query := `
		UPDATE products
		SET name = $1, description = $2, price = $3, quality = $4, stock_quantity = $5, updated_at = $6
		WHERE id = $7
	`
	_, err := r.db.Exec(ctx, query,
		p.Name, p.Description, p.Price, p.Quality, p.StockQuantity,
		time.Now().UTC(), p.ID)
	if err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}
	return nil
}
