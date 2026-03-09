import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { WalletProvider } from '@/contexts/WalletContext';

describe('Navbar', () => {
  const mockConnectWallet = vi.fn();
  const mockOpenLearn = vi.fn();

  const renderNavbar = (props = {}) => {
    const defaultProps = {
      connected: false,
      account: '',
      connectWallet: mockConnectWallet,
      onOpenLearn: mockOpenLearn,
      ...props,
    };

    return render(
      <BrowserRouter>
        <WalletProvider>
          <Navbar {...defaultProps} />
        </WalletProvider>
      </BrowserRouter>
    );
  };

  it('renders navigation items', () => {
    renderNavbar();
    // use role queries to avoid matching other text like SUPLOCK
    expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /thesis/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /nfts/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^lock$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /swap/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /bridge/i })).toBeInTheDocument();
  });

  it('displays wallet button with correct text when not connected', () => {
    renderNavbar();
    expect(screen.getByText(/initialize_wallet/i)).toBeInTheDocument();
  });

  it('displays account address when connected', () => {
    renderNavbar({ connected: true, account: '0x123...abc' });
    expect(screen.getByText(/0x123\.\.\.abc/i)).toBeInTheDocument();
  });

  it('calls connectWallet when button is clicked', () => {
    renderNavbar();
    const button = screen.getByText(/initialize_wallet/i);
    button.click();
    expect(mockConnectWallet).toHaveBeenCalled();
  });
});
