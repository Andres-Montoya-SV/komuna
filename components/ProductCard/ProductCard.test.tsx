import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard.component';
import { Product } from '@/types/marketplace.types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 29.99,
  image: '/test-image.jpg',
  category: 'Electronics',
  type: 'product',
  stock: 10,
  rating: 4.5,
  reviews: 100,
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('displays stock information', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText(/In Stock/)).toBeInTheDocument();
  });

  it('displays out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    const onAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onViewDetails when view details button is clicked', () => {
    const onViewDetails = jest.fn();
    render(<ProductCard product={mockProduct} onViewDetails={onViewDetails} />);

    const viewDetailsButton = screen.getByText('Details');
    fireEvent.click(viewDetailsButton);

    expect(onViewDetails).toHaveBeenCalledWith(mockProduct);
  });

  it('disables add to cart button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    const onAddToCart = jest.fn();
    render(<ProductCard product={outOfStockProduct} onAddToCart={onAddToCart} />);

    const addToCartButton = screen.getByText('Out of Stock');
    expect(addToCartButton).toBeDisabled();
  });
});
