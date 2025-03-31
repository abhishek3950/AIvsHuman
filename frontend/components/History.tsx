"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { getBettingHistory, claimWinnings, calculateWinnings, getBlockExplorerUrl } from "@/utils/contract";

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
  claimTxHash?: string;
}

export function History() {
  const { address } = useWallet();
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingMarketId, setClaimingMarketId] = useState<bigint | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!address) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
        }
        const history = await getBettingHistory();
        if (isMounted) {
          setBets(history);
        }
      } catch (error) {
        console.error("Error fetching betting history:", error);
        if (isMounted) {
          if (error instanceof Error) {
            if (error.message.includes("User rejected") || error.message.includes("User denied")) {
              setError("Transaction cancelled by user");
            } else if (error.message.includes("Already claimed")) {
              setError("You have already claimed winnings for this market");
            } else if (error.message.includes("Market not settled")) {
              setError("Market has not been settled yet");
            } else {
              setError(error.message);
            }
          } else {
            setError("Error fetching history");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address]);

  const handleClaim = async (marketId: bigint) => {
    try {
      setIsClaiming(true);
      setClaimingMarketId(marketId);
      setError(null);
      await claimWinnings(marketId);
      // Refresh history after claiming
      const history = await getBettingHistory();
      setBets(history);
    } catch (error) {
      console.error("Error claiming winnings:", error);
      if (error instanceof Error) {
        if (error.message.includes("User rejected") || error.message.includes("User denied")) {
          setError("Transaction cancelled by user");
        } else if (error.message.includes("Already claimed")) {
          setError("You have already claimed winnings for this market");
        } else if (error.message.includes("Market not settled")) {
          setError("Market has not been settled yet");
        } else {
          setError(error.message);
        }
      } else {
        setError("Error claiming winnings");
      }
    } finally {
      setIsClaiming(false);
      setClaimingMarketId(null);
    }
  };

  const getWinningsAmount = (bet: Bet) => {
    if (!bet.market.settled || bet.market.actualPrice === BigInt(0)) return BigInt(0);
    
    const isCorrect = bet.isOver ? bet.market.actualPrice > bet.market.aiPrediction : bet.market.actualPrice < bet.market.aiPrediction;
    if (!isCorrect) return BigInt(0);

    const totalWinningBets = bet.isOver ? bet.market.totalOverBets : bet.market.totalUnderBets;
    const totalLosingBets = bet.isOver ? bet.market.totalUnderBets : bet.market.totalOverBets;

    if (totalWinningBets === BigInt(0)) return BigInt(0);

    return calculateWinnings(bet.amount, totalWinningBets, totalLosingBets);
  };

  const getBetStatus = (bet: Bet) => {
    if (!bet.market.settled) return "Pending";
    if (bet.claimed) return "Claimed";
    
    const winnings = getWinningsAmount(bet);
    if (winnings === BigInt(0)) return "Lost";
    return "Won";
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please connect your wallet to view betting history</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading betting history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No betting history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bets.map((bet) => {
        const status = getBetStatus(bet);
        const winnings = getWinningsAmount(bet);
        const isClaimable = status === "Won" && !bet.claimed;
        const isClaiming = claimingMarketId === bet.marketId;

        return (
          <div key={bet.marketId.toString()} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Market #{bet.marketId.toString()}</h3>
                <p className="text-sm text-gray-600">
                  Bet: {ethers.formatEther(bet.amount)} tokens on {bet.isOver ? "Over" : "Under"}
                </p>
                <p className="text-sm text-gray-600">
                  AI Prediction: {ethers.formatEther(bet.market.aiPrediction)}
                </p>
                <p className="text-sm text-gray-600">
                  Actual Price: {ethers.formatEther(bet.market.actualPrice)}
                </p>
                {bet.claimTxHash && (
                  <a
                    href={getBlockExplorerUrl(bet.claimTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Claim Transaction
                  </a>
                )}
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded text-sm ${
                  status === "Won" ? "bg-green-100 text-green-800" :
                  status === "Lost" ? "bg-red-100 text-red-800" :
                  status === "Claimed" ? "bg-gray-100 text-gray-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {status}
                </span>
                {isClaimable && (
                  <button
                    onClick={() => handleClaim(bet.marketId)}
                    disabled={isClaiming}
                    className={`mt-2 px-4 py-2 rounded text-sm ${
                      isClaiming
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isClaiming ? "Claiming..." : `Claim ${ethers.formatEther(winnings)} tokens`}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 