import React, { useContext } from 'react';
import { WalletContext } from '@/contexts/WalletContext';

export const WalletConnectButton: React.FC = () => {
  const wallet = useContext(WalletContext);

  if (!wallet) {
    return <div>Error: Wallet context not available</div>;
  }

  const { isConnected, address, connectWallet, disconnectWallet, balance } = wallet;

  return (
    <div className="flex items-center gap-4">
      {isConnected && address ? (
        <div className="flex items-center gap-3 bg-darkGray px-4 py-2 rounded-lg border border-gold">
          <div className="flex flex-col">
            <span className="text-gold font-mono text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="text-gray-400 text-xs">{balance} SUPRA</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-2 bg-gold hover:bg-darkGold text-dark font-bold rounded-lg transition transform hover:scale-105"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};
