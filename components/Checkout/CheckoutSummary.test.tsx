import { render, screen } from '@testing-library/react';
import CheckoutSummary from './CheckoutSummary.component';
import { CartItem } from '@/types/marketplace.types';

const mockCartItems: CartItem[] = [
  {
    product: {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      price: 10,
      image: '/img1.jpg',
      category: 'Category 1',
      stock: 5,
    },
    quantity: 2,
  },
  {
    product: {
      id: '2',
      name: 'Product 2',
      description: 'Description 2',
      price: 20,
      image: '/img2.jpg',
      category: 'Category 2',
      stock: 10,
    },
    quantity: 1,
  },
];

describe('CheckoutSummary', () => {
  it('renders all cart items', () => {
    render(<CheckoutSummary items={mockCartItems} total={40} />);
    
    expect(screen.getByText('Product 1 x2')).toBeInTheDocument();
    expect(screen.getByText('Product 2 x1')).toBeInTheDocument();
  });

  it('displays subtotal correctly', () => {
    render(<CheckoutSummary items={mockCartItems} total={40} />);
    
    expect(screen.getByText('$40.00')).toBeInTheDocument();
  });

  it('displays free shipping for orders over $100', () => {
    render(<CheckoutSummary items={mockCartItems} total={150} />);
    
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('displays shipping cost for orders under $100', () => {
    render(<CheckoutSummary items={mockCartItems} total={50} />);
    
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('calculates and displays final total correctly', () => {
    render(<CheckoutSummary items={mockCartItems} total={50} />);
    
    // Should show final total of 60 (50 + 10 shipping)
    const totalElements = screen.getAllByText(/\$60\.00/);
    expect(totalElements.length).toBeGreaterThan(0);
  });
});


