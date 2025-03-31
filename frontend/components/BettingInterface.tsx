"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getCurrentMarket, placeBet, MarketData, checkAllowance, approveTokens, getTokenBalance } from "@/utils/contract";
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
  const [isApproving, setIsApproving] = useState(false);
  const [hasAllowance, setHasAllowance] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);

  // Fetch current BTC price
  const { data: btcPrice } = useQuery({
    queryKey: ["btcPrice"],
    queryFn: async () => {
      const response = await axios.get(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`);
      return response.data.bitcoin.usd;
    },
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  // Fetch token balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      try {
        const balance = await getTokenBalance();
        setTokenBalance(balance);
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [address]);

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

  // Check token allowance when bet amount changes
  useEffect(() => {
    const checkTokenAllowance = async () => {
      if (!betAmount || !address) return;
      try {
        const amount = ethers.parseEther(betAmount);
        const hasAllowance = await checkAllowance(amount);
        setHasAllowance(hasAllowance);
      } catch (error) {
        console.error('Error checking allowance:', error);
        setHasAllowance(false);
      }
    };
    checkTokenAllowance();
  }, [betAmount, address]);

  // Handle token approval
  const handleApprove = async () => {
    if (!betAmount) return;
    try {
      setIsApproving(true);
      setErrorMessage(null);
      const amount = ethers.parseEther(betAmount);
      const tx = await approveTokens(amount);
      await tx.wait();
      setHasAllowance(true);
    } catch (error) {
      console.error("Error approving tokens:", error);
      if (error instanceof Error) {
        if (error.message.includes("User rejected") || error.message.includes("User denied")) {
          setErrorMessage("Transaction cancelled by user");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("Error approving tokens");
      }
    } finally {
      setIsApproving(false);
    }
  };

  // Handle bet placement
  const handleBet = async () => {
    if (!betAmount || isOver === null || !marketData || !address) return;

    try {
      setIsBetting(true);
      setErrorMessage(null);
      const amount = ethers.parseEther(betAmount);

      // Place the bet (approval will be handled inside placeBet if needed)
      const betTx = await placeBet(marketData.id, isOver, amount);
      await betTx.wait();
      
      // Reset form
      setBetAmount("");
      setIsOver(null);
      
      // Refresh balances
      const newBalance = await getTokenBalance();
      setTokenBalance(newBalance);
      
    } catch (error) {
      console.error("Error placing bet:", error);
      if (error instanceof Error) {
        if (error.message.includes("User rejected") || error.message.includes("User denied")) {
          setErrorMessage("Transaction cancelled by user");
        } else if (error.message.includes("Betting window closed")) {
          setErrorMessage("Betting window is closed for this market");
        } else if (error.message.includes("Bet too small")) {
          setErrorMessage("Bet amount is too small");
        } else if (error.message.includes("Bet too large")) {
          setErrorMessage("Bet amount is too large");
        } else if (error.message.includes("Market bet limit reached")) {
          setErrorMessage("Market bet limit has been reached");
        } else if (error.message.includes("insufficient allowance")) {
          setErrorMessage("Error with token approval. Please try again.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("Error placing bet");
      }
    } finally {
      setIsBetting(false);
      setIsApproving(false);
    }
  };

  // Handle "All" button click
  const handleAllClick = () => {
    if (tokenBalance) {
      setBetAmount(ethers.formatEther(tokenBalance));
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bet Amount (tokens)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Balance: {tokenBalance ? ethers.formatEther(tokenBalance) : "0"}
                </span>
                <button
                  onClick={handleAllClick}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  All
                </button>
              </div>
            </div>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter amount"
              disabled={isLoading || isBetting}
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
            {isBetting ? (isApproving ? "Approving..." : "Placing Bet...") : "Place Bet"}
          </button>

          {errorMessage && (
            <div className="text-red-500 dark:text-red-400 text-sm mt-2">
              {errorMessage}
            </div>
          )}
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