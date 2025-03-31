"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  provider: ethers.BrowserProvider | null;
  connectWallet: () => Promise<void>;
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAddress(accounts[0].address);
          }
          setProvider(provider);
        } catch (error) {
          console.error('Error checking connection:', error);
          // Don't set error state here as it's just a check
        }
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Check if MetaMask is locked
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length === 0) {
        // MetaMask is locked or no accounts available
        setError('Please unlock MetaMask to connect your wallet');
        return;
      }

      // Request account access
      await provider.send('eth_requestAccounts', []);
      const updatedAccounts = await provider.listAccounts();
      
      if (updatedAccounts.length > 0) {
        setAddress(updatedAccounts[0].address);
        setProvider(provider);
      } else {
        setError('No accounts found. Please add an account to MetaMask');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          setError('Connection cancelled by user');
        } else if (error.message.includes('Already processing')) {
          setError('Please unlock MetaMask and try again');
        } else if (error.message.includes('Please wait')) {
          setError('Please unlock MetaMask and try again');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle account changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] || null);
      if (accounts.length === 0) {
        // User disconnected their wallet
        setAddress(null);
        setProvider(null);
      }
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
    provider,
    connectWallet,
  };
} 