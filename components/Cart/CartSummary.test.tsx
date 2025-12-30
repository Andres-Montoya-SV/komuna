import { render, screen, fireEvent } from '@testing-library/react';
import CartSummary from './CartSummary.component';

describe('CartSummary', () => {
  it('displays correct total and item count', () => {
    render(<CartSummary total={100} itemCount={3} />);

    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Items (3)')).toBeInTheDocument();
  });

  it('displays free shipping for orders over $100', () => {
    render(<CartSummary total={150} itemCount={2} />);

    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('displays shipping cost for orders under $100', () => {
    render(<CartSummary total={50} itemCount={1} />);

    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('calculates and displays final total correctly', () => {
    render(<CartSummary total={50} itemCount={1} />);

    // 50 + 10 shipping = 60
    expect(screen.getByText('$60.00')).toBeInTheDocument();
  });

  it('calls onCheckout when checkout button is clicked', () => {
    const onCheckout = jest.fn();
    render(<CartSummary total={100} itemCount={2} onCheckout={onCheckout} />);

    const checkoutButton = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutButton);

    expect(onCheckout).toHaveBeenCalled();
  });
});
