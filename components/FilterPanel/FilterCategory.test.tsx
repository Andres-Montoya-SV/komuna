import { render, screen, fireEvent } from '@testing-library/react';
import FilterCategory from './FilterCategory.component';

describe('FilterCategory', () => {
  const categories = ['Electronics', 'Clothing', 'Books'];

  it('renders all categories', () => {
    render(
      <FilterCategory 
        categories={categories} 
        onCategoryChange={() => {}}
      />
    );
    
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
  });

  it('selects correct category when provided', () => {
    render(
      <FilterCategory 
        categories={categories}
        selectedCategory="Electronics"
        onCategoryChange={() => {}}
      />
    );
    
    const electronicsRadio = screen.getByLabelText('Electronics') as HTMLInputElement;
    expect(electronicsRadio.checked).toBe(true);
  });

  it('calls onCategoryChange when category is selected', () => {
    const onCategoryChange = jest.fn();
    render(
      <FilterCategory 
        categories={categories}
        onCategoryChange={onCategoryChange}
      />
    );
    
    const electronicsRadio = screen.getByLabelText('Electronics');
    fireEvent.click(electronicsRadio);
    
    expect(onCategoryChange).toHaveBeenCalledWith('Electronics');
  });

  it('selects All Categories when no category is selected', () => {
    render(
      <FilterCategory 
        categories={categories}
        onCategoryChange={() => {}}
      />
    );
    
    const allCategoriesRadio = screen.getByLabelText('All Categories') as HTMLInputElement;
    expect(allCategoriesRadio.checked).toBe(true);
  });
});


