import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './page';

describe('Home Page', () => {
  it('renders main heading', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', { name: /welcome to socialize/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders tagline', () => {
    render(<Home />);
    
    const tagline = screen.getByText(/connect, share, and engage with your community/i);
    expect(tagline).toBeInTheDocument();
  });

  it('renders get started button', () => {
    render(<Home />);
    
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    expect(getStartedButton).toBeInTheDocument();
    expect(getStartedButton).toHaveClass('bg-primary-600');
  });

  it('renders learn more button', () => {
    render(<Home />);
    
    const learnMoreButton = screen.getByRole('button', { name: /learn more/i });
    expect(learnMoreButton).toBeInTheDocument();
    expect(learnMoreButton).toHaveClass('border', 'border-gray-300');
  });

  it('has correct layout classes', () => {
    const { container } = render(<Home />);
    
    const main = container.querySelector('main');
    expect(main).toHaveClass('flex', 'min-h-screen', 'flex-col', 'items-center', 'justify-center', 'p-24');
  });

  it('buttons have hover states', async () => {
    const user = userEvent.setup();
    render(<Home />);
    
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    const learnMoreButton = screen.getByRole('button', { name: /learn more/i });
    
    expect(getStartedButton).toHaveClass('hover:bg-primary-700');
    expect(learnMoreButton).toHaveClass('hover:bg-gray-50');
    
    await user.hover(getStartedButton);
    await user.hover(learnMoreButton);
  });

  it('renders content wrapper with correct classes', () => {
    const { container } = render(<Home />);
    
    const wrapper = container.querySelector('.z-10.max-w-5xl');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('w-full', 'items-center', 'justify-between', 'text-sm');
  });

  it('renders button container with flex layout', () => {
    const { container } = render(<Home />);
    
    const buttonContainer = container.querySelector('.flex.gap-4.justify-center');
    expect(buttonContainer).toBeInTheDocument();
    expect(buttonContainer?.children).toHaveLength(2);
  });

  it('all text content is centered', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading');
    const tagline = screen.getByText(/connect, share, and engage/i);
    
    expect(heading).toHaveClass('text-center');
    expect(tagline).toHaveClass('text-center');
  });

  it('applies correct styling to heading', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('text-4xl', 'font-bold', 'mb-8');
  });

  it('applies correct styling to tagline', () => {
    render(<Home />);
    
    const tagline = screen.getByText(/connect, share, and engage/i);
    expect(tagline).toHaveClass('text-gray-600', 'mb-8');
  });

  it('buttons have correct padding and rounded corners', () => {
    render(<Home />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('px-6', 'py-3', 'rounded-lg');
    });
  });

  it('buttons have transition effects', () => {
    render(<Home />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('transition');
    });
  });
});