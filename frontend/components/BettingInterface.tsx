"use client";

import { useState, useEffect } from "react";
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from "wagmi";
import { formatEther, parseEther } from "viem";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export function BettingInterface() {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState("");
  const [isOver, setIsOver] = useState<boolean | null>(null);

  // Fetch current BTC price
  const { data: btcPrice } = useQuery({
    queryKey: ["btcPrice"],
    queryFn: async () => {
      const response = await axios.get(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`);
      return response.data.bitcoin.usd;
    },
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  // Read current market data
  const { data: marketData } = useContractRead({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: [], // Add contract ABI here
    functionName: "getCurrentMarket",
  });

  // Place bet function
  const { data: betData, write: placeBet } = useContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: [], // Add contract ABI here
    functionName: "placeBet",
  });

  const { isLoading: isBetting } = useWaitForTransaction({
    hash: betData?.hash,
  });

  // Handle bet placement
  const handleBet = async () => {
    if (!betAmount || isOver === null || !marketData) return;

    try {
      const amount = parseEther(betAmount);
      await placeBet({
        args: [marketData.id, isOver, amount],
      });
    } catch (error) {
      console.error("Error placing bet:", error);
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
              ${marketData ? formatEther(marketData.aiPrediction) : "Loading..."}
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
              {marketData ? formatEther(marketData.totalOverBets) : "Loading..."}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Under Bets</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {marketData ? formatEther(marketData.totalUnderBets) : "Loading..."}
            </p>
          </div>
        </div>
      </div>

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
    </div>
  );
} 