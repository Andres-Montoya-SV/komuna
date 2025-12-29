import { render, screen } from '@testing-library/react';
import ProductCardInfo from './ProductCardInfo.component';

describe('ProductCardInfo', () => {
  it('renders product name and description', () => {
    render(
      <ProductCardInfo 
        name="Test Product" 
        description="Test Description" 
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders rating when provided', () => {
    render(
      <ProductCardInfo 
        name="Test Product" 
        description="Test Description"
        rating={4.5}
        reviews={100}
      />
    );
    
    expect(screen.getByText('4.5 (100)')).toBeInTheDocument();
  });

  it('does not render rating section when rating is not provided', () => {
    render(
      <ProductCardInfo 
        name="Test Product" 
        description="Test Description" 
      />
    );
    
    expect(screen.queryByText(/4\.5/)).not.toBeInTheDocument();
  });
});


