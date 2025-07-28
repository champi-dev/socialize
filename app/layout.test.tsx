import { render } from '@testing-library/react';
import RootLayout, { metadata } from './layout';

jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font-class'
  })
}));

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="child">Test Child</div>
      </RootLayout>
    );
    
    const child = container.querySelector('[data-testid="child"]');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Child');
  });

  it('sets html lang attribute', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );
    
    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'en');
  });

  it('applies Inter font class to body', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );
    
    const body = container.querySelector('body');
    expect(body).toHaveClass('inter-font-class');
  });

  it('renders multiple children', () => {
    const { container } = render(
      <RootLayout>
        <header>Header</header>
        <main>Main Content</main>
        <footer>Footer</footer>
      </RootLayout>
    );
    
    expect(container.querySelector('header')).toHaveTextContent('Header');
    expect(container.querySelector('main')).toHaveTextContent('Main Content');
    expect(container.querySelector('footer')).toHaveTextContent('Footer');
  });

  it('has correct document structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );
    
    const html = container.querySelector('html');
    const body = html?.querySelector('body');
    
    expect(html).toBeInTheDocument();
    expect(body).toBeInTheDocument();
    expect(body?.parentElement).toBe(html);
  });
});

describe('Metadata', () => {
  it('has correct title', () => {
    expect(metadata.title).toBe('Socialize - Connect with Friends');
  });

  it('has correct description', () => {
    expect(metadata.description).toBe('A modern social networking platform');
  });

  it('exports metadata object', () => {
    expect(metadata).toBeDefined();
    expect(typeof metadata).toBe('object');
  });
});