"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { getProvider } from "@/utils/contract";

const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS as string;
const FAUCET_ABI = [
  "function requestTokens() external",
  "function lastRequest(address) public view returns (uint256)",
  "function cooldown() public view returns (uint256)",
  "function amount() public view returns (uint256)",
  "event TokensRequested(address indexed user, uint256 amount)"
];

export function Faucet() {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<bigint>(BigInt(0));
  const [amount, setAmount] = useState<bigint>(BigInt(0));
  const [lastRequest, setLastRequest] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const fetchFaucetData = async () => {
      if (!address) {
        setError('Please connect your wallet first');
        return;
      }

      try {
        const provider = getProvider();
        if (!provider) {
          setError('No ethereum provider found');
          return;
        }

        const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider);
        
        const [cooldownValue, amountValue, lastRequestValue] = await Promise.all([
          faucetContract.cooldown(),
          faucetContract.amount(),
          faucetContract.lastRequest(address)
        ]);

        setCooldown(cooldownValue);
        setAmount(amountValue);
        setLastRequest(lastRequestValue);
        setError(null);
      } catch (err) {
        console.error('Error fetching faucet data:', err);
        setError('Error fetching faucet data. Please make sure you are connected to Base Sepolia network.');
      }
    };

    fetchFaucetData();
  }, [address]);

  const handleRequestTokens = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const provider = getProvider();
      if (!provider) {
        setError('No ethereum provider found');
        return;
      }

      const signer = await provider.getSigner();
      const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);
      
      const tx = await faucetContract.requestTokens();
      await tx.wait();
      
      // Refresh data after successful request
      const lastRequestValue = await faucetContract.lastRequest(address);
      setLastRequest(lastRequestValue);
    } catch (err) {
      console.error('Error requesting tokens:', err);
      setError('Error requesting tokens. Please make sure you are connected to Base Sepolia network.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRemaining = () => {
    if (!lastRequest || !cooldown) return null;
    
    const now = BigInt(Math.floor(Date.now() / 1000));
    const nextRequestTime = lastRequest + cooldown;
    
    if (now >= nextRequestTime) return null;
    
    const remaining = nextRequestTime - now;
    const hours = Number(remaining) / 3600;
    const minutes = (Number(remaining) % 3600) / 60;
    
    return `${Math.floor(hours)}h ${Math.floor(minutes)}m`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Test Token Faucet
      </h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Amount per request</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {amount ? `${ethers.formatEther(amount)} tokens` : 'Loading...'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {timeRemaining && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Please wait {timeRemaining} before requesting more tokens
            </p>
          </div>
        )}

        <button
          onClick={handleRequestTokens}
          disabled={isLoading || !!timeRemaining || !address}
          className={`w-full py-2 px-4 rounded-lg font-medium text-white
            ${isLoading || !!timeRemaining || !address
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isLoading ? 'Requesting...' : 'Request Tokens'}
        </button>
      </div>
    </div>
  );
} 