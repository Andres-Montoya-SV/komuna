import { render, screen, fireEvent } from '@testing-library/react';
import CartItemComponent from './CartItem.component';
import { CartItem } from '@/types/marketplace.types';

const mockCartItem: CartItem = {
  item: {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    image: '/test.jpg',
    category: 'Electronics',
    type: 'product',
    stock: 10,
  },
  quantity: 2,
};

describe('CartItem', () => {
  it('renders product information', () => {
    render(<CartItemComponent item={mockCartItem} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('displays correct quantity', () => {
    render(<CartItemComponent item={mockCartItem} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays correct subtotal', () => {
    render(<CartItemComponent item={mockCartItem} />);

    // 29.99 * 2 = 59.98
    expect(screen.getByText('$59.98')).toBeInTheDocument();
  });

  it('calls onUpdateQuantity when quantity buttons are clicked', () => {
    const onUpdateQuantity = jest.fn();
    render(<CartItemComponent item={mockCartItem} onUpdateQuantity={onUpdateQuantity} />);

    const buttons = screen.getAllByRole('button');
    const increaseButton = buttons.find((btn) => btn.textContent === '+');
    const decreaseButton = buttons.find((btn) => btn.textContent === '-');

    fireEvent.click(increaseButton!);
    expect(onUpdateQuantity).toHaveBeenCalledWith('1', 3);

    fireEvent.click(decreaseButton!);
    expect(onUpdateQuantity).toHaveBeenCalledWith('1', 1);
  });

  it('disables decrease button when quantity is 1', () => {
    const singleItem = { ...mockCartItem, quantity: 1 };
    render(<CartItemComponent item={singleItem} />);

    const buttons = screen.getAllByRole('button');
    const decreaseButton = buttons.find((btn) => btn.textContent === '-');
    expect(decreaseButton).toBeDisabled();
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = jest.fn();
    render(<CartItemComponent item={mockCartItem} onRemove={onRemove} />);

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith('1');
  });
});
