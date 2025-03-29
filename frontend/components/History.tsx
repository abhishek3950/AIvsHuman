"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { getBettingHistory, claimWinnings, calculateWinnings } from "@/utils/contract";

interface Bet {
  marketId: bigint;
  isOver: boolean;
  amount: bigint;
  claimed: boolean;
  market: {
    aiPrediction: bigint;
    actualPrice: bigint;
    totalOverBets: bigint;
    totalUnderBets: bigint;
    settled: boolean;
  };
}

export function History() {
  const { address } = useWallet();
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const history = await getBettingHistory();
        setBets(history);
      } catch (error) {
        console.error("Error fetching betting history:", error);
        setError(error instanceof Error ? error.message : "Error fetching history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [address]);

  const handleClaim = async (marketId: bigint) => {
    try {
      setIsClaiming(true);
      setError(null);
      await claimWinnings(marketId);
      // Refresh history after claiming
      const history = await getBettingHistory();
      setBets(history);
    } catch (error) {
      console.error("Error claiming winnings:", error);
      setError(error instanceof Error ? error.message : "Error claiming winnings");
    } finally {
      setIsClaiming(false);
    }
  };

  const getWinningsAmount = (bet: Bet) => {
    if (!bet.market.settled || bet.market.actualPrice === BigInt(0)) return BigInt(0);
    
    const isWinningBet = 
      (bet.isOver && bet.market.actualPrice > bet.market.aiPrediction) ||
      (!bet.isOver && bet.market.actualPrice < bet.market.aiPrediction);
    
    if (!isWinningBet) return BigInt(0);
    
    return calculateWinnings(
      bet.amount,
      bet.isOver ? bet.market.totalOverBets : bet.market.totalUnderBets,
      bet.isOver ? bet.market.totalUnderBets : bet.market.totalOverBets
    );
  };

  if (!address) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Please connect your wallet to view betting history
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Loading betting history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No betting history found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bets.map((bet) => (
        <div
          key={bet.marketId.toString()}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Market ID: {bet.marketId.toString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bet: {ethers.formatEther(bet.amount)} tokens on{" "}
                {bet.isOver ? "Over" : "Under"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI Prediction: ${ethers.formatEther(bet.market.aiPrediction)}
              </p>
              {bet.market.settled && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Actual Price: ${ethers.formatEther(bet.market.actualPrice)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Pool: {ethers.formatEther(bet.market.totalOverBets + bet.market.totalUnderBets)} tokens
                  </p>
                </>
              )}
            </div>
            {bet.market.settled && !bet.claimed && (
              <button
                onClick={() => handleClaim(bet.marketId)}
                disabled={isClaiming}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaiming ? "Claiming..." : `Claim ${ethers.formatEther(getWinningsAmount(bet))} tokens`}
              </button>
            )}
            {bet.claimed && (
              <span className="text-green-600 dark:text-green-400">
                Claimed {ethers.formatEther(getWinningsAmount(bet))} tokens
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 