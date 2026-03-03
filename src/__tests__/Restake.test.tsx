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
    expect(screen.getByText(/Supralend/i)).toBeInTheDocument();
    expect(screen.getByText(/Solido Money/i)).toBeInTheDocument();
    expect(screen.getByText(/Atmos Protocol/i)).toBeInTheDocument();
  });
});
