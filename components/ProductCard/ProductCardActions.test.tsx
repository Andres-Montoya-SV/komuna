import { render, screen, fireEvent } from '@testing-library/react';
import ProductCardActions from './ProductCardActions.component';
import { Product } from '@/types/marketplace.types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 29.99,
  image: '/test.jpg',
  category: 'Electronics',
  stock: 10,
};

describe('ProductCardActions', () => {
  it('renders view details and add to cart buttons', () => {
    render(<ProductCardActions product={mockProduct} />);
    
    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('calls onAddToCart when add to cart is clicked', () => {
    const onAddToCart = jest.fn();
    render(<ProductCardActions product={mockProduct} onAddToCart={onAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onViewDetails when view details is clicked', () => {
    const onViewDetails = jest.fn();
    render(<ProductCardActions product={mockProduct} onViewDetails={onViewDetails} />);
    
    fireEvent.click(screen.getByText('View Details'));
    expect(onViewDetails).toHaveBeenCalledWith(mockProduct);
  });

  it('disables add to cart button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCardActions product={outOfStockProduct} />);
    
    const button = screen.getByText('Out of Stock');
    expect(button).toBeDisabled();
  });
});


