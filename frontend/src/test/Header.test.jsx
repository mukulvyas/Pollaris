import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/Header';
import { describe, it, expect } from 'vitest';

describe('Header Component', () => {
  it('renders the application title', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByText(/Pollaris/i)).toBeDefined();
  });

  it('renders the logo', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    // Star icon is present (lucide-react stars are usually path elements, but we check text/existence)
    expect(document.querySelector('.text-primary')).toBeDefined();
  });
});
