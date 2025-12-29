import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Checkout from './Checkout.component';
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
];

describe('Checkout', () => {
  it('renders checkout form and summary', () => {
    render(<Checkout items={mockCartItems} />);
    
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Shipping Information')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
  });

  it('calls onComplete when form is submitted with valid data', async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    render(<Checkout items={mockCartItems} onComplete={onComplete} />);
    
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/Address/i), '123 Main St');
    await user.type(screen.getByLabelText(/City/i), 'New York');
    await user.type(screen.getByLabelText(/Zip Code/i), '10001');
    await user.selectOptions(screen.getByLabelText(/Payment Method/i), 'credit-card');
    
    const submitButton = screen.getByText('Place Order');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<Checkout items={mockCartItems} onCancel={onCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalled();
  });
});


