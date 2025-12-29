import { render, screen, fireEvent } from '@testing-library/react';
import ProductListFilters from './ProductListFilters.component';
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
  {
    id: '2',
    name: 'Product 2',
    description: 'Description 2',
    price: 100,
    image: '/img2.jpg',
    category: 'Clothing',
    stock: 10,
  },
];

describe('ProductListFilters', () => {
  it('renders filter components', () => {
    render(<ProductListFilters products={mockProducts} onFilterChange={() => {}} />);
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('displays all categories from products', () => {
    render(<ProductListFilters products={mockProducts} onFilterChange={() => {}} />);
    
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  it('calls onFilterChange when filters are updated', () => {
    const onFilterChange = jest.fn();
    render(<ProductListFilters products={mockProducts} onFilterChange={onFilterChange} />);
    
    const electronicsRadio = screen.getByLabelText('Electronics');
    fireEvent.click(electronicsRadio);
    
    expect(onFilterChange).toHaveBeenCalled();
  });

  it('resets filters when reset button is clicked', () => {
    const onFilterChange = jest.fn();
    render(
      <ProductListFilters 
        products={mockProducts} 
        filters={{ category: 'Electronics' }}
        onFilterChange={onFilterChange} 
      />
    );
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(onFilterChange).toHaveBeenCalledWith({});
  });
});


