import { render, screen } from '@testing-library/react';
import ProductCardPrice from './ProductCardPrice.component';
import { Product } from '@/types/marketplace.types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 29.99,
  image: '/test.jpg',
  category: 'Electronics',
  type: 'product',
  stock: 10,
};

describe('ProductCardPrice', () => {
  it('formats and displays price correctly', () => {
    render(<ProductCardPrice price={29.99} stock={10} type="product" item={mockProduct} />);

    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('displays in stock message when stock is available', () => {
    render(<ProductCardPrice price={29.99} stock={10} type="product" item={mockProduct} />);

    expect(screen.getByText(/In Stock/)).toBeInTheDocument();
  });

  it('displays only X left when stock is less than 10', () => {
    const lowStockProduct = { ...mockProduct, stock: 5 };
    render(<ProductCardPrice price={29.99} stock={5} type="product" item={lowStockProduct} />);

    expect(screen.getByText(/Only 5 left/)).toBeInTheDocument();
  });

  it('displays out of stock message when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCardPrice price={29.99} stock={0} type="product" item={outOfStockProduct} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('formats large prices correctly', () => {
    const largePriceProduct = { ...mockProduct, price: 1234.56, stock: 5 };
    render(<ProductCardPrice price={1234.56} stock={5} type="product" item={largePriceProduct} />);

    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });
});
