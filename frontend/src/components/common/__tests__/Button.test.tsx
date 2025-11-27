import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByText('Primary Button');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('applies secondary variant when specified', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByText('Secondary Button');
    expect(button).toHaveClass('bg-dark-700');
  });

  it('applies outline variant when specified', () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByText('Outline Button');
    expect(button).toHaveClass('border-2');
  });

  it('applies danger variant when specified', () => {
    render(<Button variant="danger">Danger Button</Button>);
    const button = screen.getByText('Danger Button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('applies ghost variant when specified', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    const button = screen.getByText('Ghost Button');
    expect(button).toHaveClass('text-gray-300');
  });

  it('applies small size when specified', () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByText('Small Button');
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  it('applies medium size by default', () => {
    render(<Button>Medium Button</Button>);
    const button = screen.getByText('Medium Button');
    expect(button).toHaveClass('px-4', 'py-2', 'text-base');
  });

  it('applies large size when specified', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByText('Large Button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('applies full width when specified', () => {
    render(<Button fullWidth>Full Width Button</Button>);
    const button = screen.getByText('Full Width Button');
    expect(button).toHaveClass('w-full');
  });

  it('shows loading state with spinner', () => {
    render(<Button isLoading>Loading Button</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
  });

  it('disables button when isLoading is true', () => {
    render(<Button isLoading>Loading Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    const button = screen.getByText('Clickable Button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not trigger click when loading', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} isLoading>Loading Button</Button>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByText('Custom Button');
    expect(button).toHaveClass('custom-class');
  });

  it('passes through additional props', () => {
    render(<Button type="submit" data-testid="submit-button">Submit</Button>);
    const button = screen.getByTestId('submit-button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
