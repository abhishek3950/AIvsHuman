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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      if (!address) {
        setIsLoading(false);
        setErrorMessage("Please connect your wallet first");
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        console.log("Fetching market data...");
        const data = await getCurrentMarket();
        console.log("Market data received:", data);
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setErrorMessage(error instanceof Error ? error.message : "Error fetching market data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
    return () => clearInterval(interval);
  }, [address]);

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
      setErrorMessage(error instanceof Error ? error.message : "Error placing bet");
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
              ${btcPrice?.toLocaleString() ?? "Loading..."}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">AI Prediction</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {isLoading ? "Loading..." : marketData ? `$${ethers.formatEther(marketData.aiPrediction)}` : "No active market"}
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
              {isLoading ? "Loading..." : marketData ? ethers.formatEther(marketData.totalOverBets) : "0"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Under Bets</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {isLoading ? "Loading..." : marketData ? ethers.formatEther(marketData.totalUnderBets) : "0"}
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      {address && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bet Amount (tokens)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter amount"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsOver(true)}
              disabled={isLoading || isBetting}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-white
                ${isOver === true
                  ? 'bg-green-600'
                  : 'bg-gray-600 hover:bg-gray-700'
                }`}
            >
              Over
            </button>
            <button
              onClick={() => setIsOver(false)}
              disabled={isLoading || isBetting}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-white
                ${isOver === false
                  ? 'bg-red-600'
                  : 'bg-gray-600 hover:bg-gray-700'
                }`}
            >
              Under
            </button>
          </div>

          <button
            onClick={handleBet}
            disabled={!betAmount || isOver === null || isBetting || isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBetting ? "Placing Bet..." : "Place Bet"}
          </button>
        </div>
      )}

      {!address && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Please connect your wallet to place bets
        </p>
      )}
    </div>
  );
} 