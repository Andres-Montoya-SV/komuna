import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar.component';

describe('SearchBar', () => {
  it('renders search input with placeholder', () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search products...');
    expect(input).toBeInTheDocument();
  });

  it('uses custom placeholder when provided', () => {
    render(<SearchBar placeholder="Custom placeholder" />);
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText('Search products...');
    await user.type(input, 'test query');
    await user.click(screen.getByRole('button'));
    
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('initializes with initialValue', () => {
    render(<SearchBar initialValue="initial search" />);
    
    const input = screen.getByPlaceholderText('Search products...') as HTMLInputElement;
    expect(input.value).toBe('initial search');
  });

  it('updates input value as user types', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Search products...') as HTMLInputElement;
    await user.type(input, 'new query');
    
    expect(input.value).toBe('new query');
  });
});


