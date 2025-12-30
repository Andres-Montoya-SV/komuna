import { render, screen, fireEvent } from '@testing-library/react';
import FilterSort from './FilterSort.component';

describe('FilterSort', () => {
  it('renders sort options', () => {
    render(<FilterSort onSortChange={() => {}} />);

    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
    expect(screen.getByText('Price: High to Low')).toBeInTheDocument();
    expect(screen.getByText('Name: A to Z')).toBeInTheDocument();
    expect(screen.getByText('Name: Z to A')).toBeInTheDocument();
    expect(screen.getByText('Highest Rated')).toBeInTheDocument();
  });

  it('selects correct sort option when provided', () => {
    render(<FilterSort sortBy="price-asc" onSortChange={() => {}} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('price-asc');
  });

  it('calls onSortChange when sort option changes', () => {
    const onSortChange = jest.fn();
    render(<FilterSort onSortChange={onSortChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'price-desc' } });

    expect(onSortChange).toHaveBeenCalledWith('price-desc');
  });

  it('handles default/undefined sort option', () => {
    const onSortChange = jest.fn();
    render(<FilterSort onSortChange={onSortChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });

    expect(onSortChange).toHaveBeenCalledWith(undefined);
  });
});
