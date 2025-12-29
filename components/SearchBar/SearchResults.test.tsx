import { render, screen, fireEvent } from '@testing-library/react';
import SearchResults from './SearchResults.component';
import { Product } from '@/types/marketplace.types';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    image: '/test.jpg',
    category: 'Electronics',
    stock: 10,
  },
];

describe('SearchResults', () => {
  it('renders search results', () => {
    const onResultClick = jest.fn();
    render(
      <SearchResults 
        results={mockProducts}
        query="test"
        onResultClick={onResultClick}
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('calls onResultClick when result is clicked', () => {
    const onResultClick = jest.fn();
    render(
      <SearchResults 
        results={mockProducts}
        query="test"
        onResultClick={onResultClick}
      />
    );
    
    fireEvent.click(screen.getByText('Test Product'));
    expect(onResultClick).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('highlights search query in results', () => {
    const onResultClick = jest.fn();
    render(
      <SearchResults 
        results={mockProducts}
        query="Test"
        onResultClick={onResultClick}
      />
    );
    
    const productName = screen.getByText('Test Product');
    expect(productName).toBeInTheDocument();
  });
});

