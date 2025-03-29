import { useState, useEffect } from 'react';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask to use this app');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
    } catch (err) {
      setError('Error connecting wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    connectWallet();
  }, []);

  // Handle account changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] || null);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  return {
    address,
    isConnecting,
    error,
    connectWallet
  };
} 