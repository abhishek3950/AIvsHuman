"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getCurrentMarket, placeBet, MarketData } from "@/utils/contract";
import { useWallet } from "@/hooks/useWallet";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export function BettingInterface() {
  const { address, isConnecting, error } = useWallet();
  const [betAmount, setBetAmount] = useState("");
  const [isOver, setIsOver] = useState<boolean | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isBetting, setIsBetting] = useState(false);

  // Fetch current BTC price
  const { data: btcPrice } = useQuery({
    queryKey: ["btcPrice"],
    queryFn: async () => {
      const response = await axios.get(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`);
      return response.data.bitcoin.usd;
    },
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await getCurrentMarket();
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle bet placement
  const handleBet = async () => {
    if (!betAmount || isOver === null || !marketData || !address) return;

    try {
      setIsBetting(true);
      const amount = ethers.parseEther(betAmount);
      await placeBet(marketData.id, isOver, amount);
      setBetAmount("");
      setIsOver(null);
    } catch (error) {
      console.error("Error placing bet:", error);
    } finally {
      setIsBetting(false);
    }
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!marketData) return "Loading...";
    const endTime = Number(marketData.endTime);
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;
    
    if (remaining <= 0) return "Market ended";
    
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Current Market
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current BTC Price</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              ${btcPrice?.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">AI Prediction</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              ${marketData ? ethers.formatEther(marketData.aiPrediction) : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Time Remaining: {getTimeRemaining()}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Over Bets</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {marketData ? ethers.formatEther(marketData.totalOverBets) : "Loading..."}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Under Bets</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {marketData ? ethers.formatEther(marketData.totalUnderBets) : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center py-4">
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        </div>
      ) : !address ? (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isConnecting ? "Connecting wallet..." : "Please connect your wallet to place bets"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setIsOver(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
                isOver === true
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              Over
            </button>
            <button
              onClick={() => setIsOver(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
                isOver === false
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              Under
            </button>
          </div>

          <div className="flex space-x-4">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter bet amount"
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="10"
              max="100"
              step="1"
            />
            <button
              onClick={handleBet}
              disabled={!betAmount || isOver === null || isBetting}
              className="py-3 px-6 rounded-lg bg-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBetting ? "Placing Bet..." : "Place Bet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 