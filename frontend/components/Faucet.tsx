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
      if (!address) return;

      try {
        const provider = getProvider();
        const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider);
        
        const [cooldownValue, amountValue, lastRequestValue] = await Promise.all([
          faucetContract.cooldown(),
          faucetContract.amount(),
          faucetContract.lastRequest(address)
        ]);

        setCooldown(cooldownValue);
        setAmount(amountValue);
        setLastRequest(lastRequestValue);
      } catch (err) {
        console.error('Error fetching faucet data:', err);
        setError('Error fetching faucet data');
      }
    };

    fetchFaucetData();
  }, [address]);

  const handleRequestTokens = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const provider = getProvider();
      const signer = await provider.getSigner();
      const faucetContract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);
      
      const tx = await faucetContract.requestTokens();
      await tx.wait();
      
      // Refresh data after successful request
      const lastRequestValue = await faucetContract.lastRequest(address);
      setLastRequest(lastRequestValue);
    } catch (err) {
      console.error('Error requesting tokens:', err);
      setError('Error requesting tokens');
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
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {amount ? ethers.formatEther(amount) : "Loading..."} tokens
          </p>
        </div>

        {error && (
          <div className="text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        {timeRemaining ? (
          <div className="text-gray-600 dark:text-gray-300">
            Next request available in: {timeRemaining}
          </div>
        ) : (
          <button
            onClick={handleRequestTokens}
            disabled={isLoading || !address}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Requesting..." : "Request Tokens"}
          </button>
        )}

        {!address && (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Please connect your wallet to request tokens
          </p>
        )}
      </div>
    </div>
  );
} 