import { render, screen } from '@testing-library/react';
import ProductList from './ProductList.component';
import { Product } from '@/types/marketplace.types';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    description: 'Description 1',
    price: 10,
    image: '/img1.jpg',
    category: 'Electronics',
    stock: 5,
  },
];

describe('ProductList', () => {
  it('renders products list with filters', () => {
    render(<ProductList products={mockProducts} />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });

  it('renders empty state when no products', () => {
    render(<ProductList products={[]} />);
    
    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('renders filter panel', () => {
    render(<ProductList products={mockProducts} />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
});


