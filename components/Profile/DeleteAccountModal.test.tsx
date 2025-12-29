import { render, screen, fireEvent } from '@testing-library/react';
import DeleteAccountModal from './DeleteAccountModal.component';

describe('DeleteAccountModal', () => {
  it('renders delete confirmation modal', () => {
    render(
      <DeleteAccountModal
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.getByText(/delete account/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it('calls onConfirm when delete button is clicked', () => {
    const onConfirm = jest.fn();
    render(
      <DeleteAccountModal
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);
    
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(
      <DeleteAccountModal
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalled();
  });
});

