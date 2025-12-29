import { render, screen } from '@testing-library/react';
import ProductCardPrice from './ProductCardPrice.component';

describe('ProductCardPrice', () => {
  it('formats and displays price correctly', () => {
    render(<ProductCardPrice price={29.99} stock={10} />);
    
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('displays in stock message when stock is available', () => {
    render(<ProductCardPrice price={29.99} stock={10} />);
    
    expect(screen.getByText(/In Stock/)).toBeInTheDocument();
    expect(screen.getByText(/\(10\)/)).toBeInTheDocument();
  });

  it('displays out of stock message when stock is 0', () => {
    render(<ProductCardPrice price={29.99} stock={0} />);
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('formats large prices correctly', () => {
    render(<ProductCardPrice price={1234.56} stock={5} />);
    
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });
});


