import { render, screen } from '@testing-library/react';
import Cart from './Cart.component';
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

describe('Cart', () => {
  it('renders cart items', () => {
    render(<Cart items={mockCartItems} />);
    
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('displays empty cart message when no items', () => {
    render(<Cart items={[]} />);
    
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('calculates and displays correct total', () => {
    render(<Cart items={mockCartItems} />);
    
    // Total should be (10 * 2) + (20 * 1) = 40
    expect(screen.getByText('$40.00')).toBeInTheDocument();
  });

  it('displays cart title', () => {
    render(<Cart items={mockCartItems} />);
    
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });
});


