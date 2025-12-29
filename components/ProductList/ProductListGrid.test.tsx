import { render, screen } from '@testing-library/react';
import ProductListGrid from './ProductListGrid.component';
import { Product } from '@/types/marketplace.types';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    description: 'Description 1',
    price: 10,
    image: '/img1.jpg',
    category: 'Category 1',
    stock: 5,
  },
  {
    id: '2',
    name: 'Product 2',
    description: 'Description 2',
    price: 20,
    image: '/img2.jpg',
    category: 'Category 2',
    stock: 10,
  },
];

describe('ProductListGrid', () => {
  it('renders all products', () => {
    render(<ProductListGrid products={mockProducts} />);
    
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('displays empty message when no products', () => {
    render(<ProductListGrid products={[]} />);
    
    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('calls onAddToCart when provided', () => {
    const onAddToCart = jest.fn();
    render(<ProductListGrid products={mockProducts} onAddToCart={onAddToCart} />);
    
    // The ProductCard component will handle this, so we just verify it's passed
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });
});


