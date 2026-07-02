import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

export type TransactionStatus = 'pending' | 'confirming' | 'finalized' | 'failed';

export interface Transaction {
  hash: string;
  description: string;
  status: TransactionStatus;
  timestamp: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  trackTransaction: (hash: string, description: string) => void;
  updateTransactionStatus: (hash: string, status: TransactionStatus) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const trackTransaction = useCallback((hash: string, description: string) => {
    const newTx: Transaction = {
      hash,
      description,
      status: 'pending',
      timestamp: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev].slice(0, 10)); // Keep last 10
    
    toast.info(`Transaction Sent: ${description}`, {
      description: `Hash: ${hash.slice(0, 10)}...`,
      action: {
        label: 'View',
        onClick: () => window.open(`https://testnet.suprascan.io/tx/${hash}`, '_blank'),
      },
    });
  }, []);

  const updateTransactionStatus = useCallback((hash: string, status: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx))
    );

    if (status === 'finalized') {
      toast.success('Transaction Finalized', {
        description: hash.slice(0, 10) + '...',
      });
    } else if (status === 'failed') {
      toast.error('Transaction Failed', {
        description: hash.slice(0, 10) + '...',
      });
    }
  }, []);

  return (
    <TransactionContext.Provider value={{ transactions, trackTransaction, updateTransactionStatus }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionTracker = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionTracker must be used within TransactionProvider');
  }
  return context;
};
