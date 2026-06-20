import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingScreen } from '../loading-screen';

describe('LoadingScreen component', () => {
  it('renders the loading text and title', () => {
    render(<LoadingScreen />);
    
    const title = screen.getByText('Hytale UI Studio');
    expect(title).toBeInTheDocument();

    const loadingText = screen.getByText('Loading components...');
    expect(loadingText).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    render(<LoadingScreen />);
    const image = screen.getByAltText('Hytale Studio');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/hytale-studio_foreground.png');
  });
});
