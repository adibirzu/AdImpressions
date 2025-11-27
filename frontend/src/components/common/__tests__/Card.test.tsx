import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../Card';

describe('Card Component', () => {
  it('renders with children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    const { container } = render(<Card>Default Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-dark-800', 'border', 'border-dark-600', 'rounded-lg');
  });

  it('applies hover variant', () => {
    const { container } = render(<Card variant="hover">Hover Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:border-dark-500', 'transition-colors');
  });

  it('applies clickable variant', () => {
    const { container } = render(<Card variant="clickable">Clickable Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:border-primary-600', 'cursor-pointer');
  });

  it('applies no padding when specified', () => {
    const { container } = render(<Card padding="none">No Padding Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('p-3', 'p-4', 'p-6');
  });

  it('applies small padding when specified', () => {
    const { container } = render(<Card padding="sm">Small Padding Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-3');
  });

  it('applies medium padding by default', () => {
    const { container } = render(<Card>Medium Padding Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-4');
  });

  it('applies large padding when specified', () => {
    const { container } = render(<Card padding="lg">Large Padding Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-6');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Custom Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('handles click events when clickable', () => {
    const handleClick = jest.fn();
    render(<Card variant="clickable" onClick={handleClick}>Clickable Card</Card>);
    const card = screen.getByText('Clickable Card');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('passes through additional props', () => {
    render(<Card data-testid="test-card">Test Card</Card>);
    const card = screen.getByTestId('test-card');
    expect(card).toBeInTheDocument();
  });

  it('renders complex children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
        <button>Action</button>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('applies overflow-hidden for rounded corners', () => {
    const { container } = render(<Card>Overflow Card</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('overflow-hidden');
  });
});
