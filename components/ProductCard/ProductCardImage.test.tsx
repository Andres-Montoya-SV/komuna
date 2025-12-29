import { render, screen, fireEvent } from '@testing-library/react';
import ProductCardImage from './ProductCardImage.component';

describe('ProductCardImage', () => {
  it('renders image with correct src and alt', () => {
    render(<ProductCardImage image="/test.jpg" name="Test Product" />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', '/test.jpg');
  });

  it('calls onClick when image is clicked', () => {
    const onClick = jest.fn();
    render(<ProductCardImage image="/test.jpg" name="Test Product" onClick={onClick} />);
    
    const figure = screen.getByAltText('Test Product').closest('figure');
    fireEvent.click(figure!);
    
    expect(onClick).toHaveBeenCalled();
  });

  it('does not throw error when onClick is not provided', () => {
    render(<ProductCardImage image="/test.jpg" name="Test Product" />);
    
    const figure = screen.getByAltText('Test Product').closest('figure');
    expect(() => fireEvent.click(figure!)).not.toThrow();
  });
});


