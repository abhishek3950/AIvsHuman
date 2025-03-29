import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract, MarketData, UserBets } from '@/utils/contract';
import { useWallet } from './useWallet';

export function useBettingContract() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [userBets, setUserBets] = useState<UserBets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useWallet();

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const contract = await getContract();
        const data = await contract.getCurrentMarket();
        setMarketData(data);
      } catch (err) {
        setError('Error fetching market data');
        console.error('Error fetching market data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch user bets when address changes
  useEffect(() => {
    const fetchUserBets = async () => {
      if (!address || !marketData) return;

      try {
        const contract = await getContract();
        const bets = await contract.getUserBets(marketData.id, address);
        setUserBets(bets);
      } catch (err) {
        setError('Error fetching user bets');
        console.error('Error fetching user bets:', err);
      }
    };

    fetchUserBets();
  }, [address, marketData]);

  return {
    marketData,
    userBets,
    isLoading,
    error
  };
} 