import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutForm from './CheckoutForm.component';

describe('CheckoutForm', () => {
  it('renders all form fields', () => {
    render(<CheckoutForm orderData={{}} onDataChange={() => {}} />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Zip Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Method/i)).toBeInTheDocument();
  });

  it('populates fields with orderData', () => {
    const orderData = {
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St',
      city: 'New York',
      zipCode: '10001',
      paymentMethod: 'credit-card',
    };

    render(<CheckoutForm orderData={orderData} onDataChange={() => {}} />);

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New York')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('credit-card')).toBeInTheDocument();
  });

  it('calls onDataChange when input values change', async () => {
    const user = userEvent.setup();
    const onDataChange = jest.fn();
    render(<CheckoutForm orderData={{}} onDataChange={onDataChange} />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    await user.type(nameInput, 'John Doe');

    expect(onDataChange).toHaveBeenCalled();
  });
});
