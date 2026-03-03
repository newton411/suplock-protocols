import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Restake from '@/pages/Restake';

describe('Restake page', () => {
  it('renders header and protocol cards', () => {
    render(
      <BrowserRouter>
        <Restake />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cross‑Protocol Restaking/i)).toBeInTheDocument();
    // look for heading-level names to avoid matching descriptions
    expect(screen.getByRole('heading', { level: 3, name: /Supralend/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Solido Money/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Atmos Protocol/i })).toBeInTheDocument();
  });
});
