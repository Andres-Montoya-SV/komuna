import { render, screen, fireEvent } from '@testing-library/react';
import FilterPriceRange from './FilterPriceRange.component';

describe('FilterPriceRange', () => {
  it('renders price range inputs', () => {
    render(
      <FilterPriceRange 
        maxPrice={1000}
        onPriceChange={() => {}}
      />
    );
    
    const inputs = screen.getAllByRole('slider');
    expect(inputs).toHaveLength(2);
  });

  it('displays current min and max price values', () => {
    render(
      <FilterPriceRange 
        maxPrice={1000}
        minPrice={100}
        maxPriceValue={500}
        onPriceChange={() => {}}
      />
    );
    
    expect(screen.getByText(/Min: \$100/)).toBeInTheDocument();
    expect(screen.getByText(/Max: \$500/)).toBeInTheDocument();
  });

  it('calls onPriceChange when min price changes', () => {
    const onPriceChange = jest.fn();
    render(
      <FilterPriceRange 
        maxPrice={1000}
        maxPriceValue={500}
        onPriceChange={onPriceChange}
      />
    );
    
    const inputs = screen.getAllByRole('slider');
    fireEvent.change(inputs[0], { target: { value: '200' } });
    
    expect(onPriceChange).toHaveBeenCalledWith(200, 500);
  });

  it('calls onPriceChange when max price changes', () => {
    const onPriceChange = jest.fn();
    render(
      <FilterPriceRange 
        maxPrice={1000}
        minPrice={100}
        onPriceChange={onPriceChange}
      />
    );
    
    const inputs = screen.getAllByRole('slider');
    fireEvent.change(inputs[1], { target: { value: '800' } });
    
    expect(onPriceChange).toHaveBeenCalledWith(100, 800);
  });
});


