import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from './RegisterForm.component';

describe('RegisterForm', () => {
  it('renders registration form fields', () => {
    render(<RegisterForm />);

    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('allows selecting account type', () => {
    render(<RegisterForm />);

    const buyerRadio = screen.getByLabelText('Buyer');
    const sellerRadio = screen.getByLabelText('Seller');

    expect(buyerRadio).toBeChecked();
    fireEvent.click(sellerRadio);
    expect(sellerRadio).toBeChecked();
  });

  it('validates password strength', async () => {
    render(<RegisterForm />);

    const user = userEvent.setup();
    const passwordInput = screen.getByPlaceholderText(/password/i);
    await user.type(passwordInput, 'weak');

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });
});
