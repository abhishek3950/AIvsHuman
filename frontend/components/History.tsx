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

type Tab = "claimable" | "history";

export function History() {
  const { address } = useWallet();
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingMarketId, setClaimingMarketId] = useState<bigint | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const betsPerPage = 5;

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
        if (bets.length === 0 && isMounted) {
          setIsLoading(true);
          setError(null);
        }
        const history = await getBettingHistory();
        if (isMounted) {
          setBets(history);
          setTotalPages(Math.ceil(history.length / betsPerPage));
        }
      } catch (error) {
        console.error("Error fetching betting history:", error);
        if (isMounted) {
          handleHistoryError(error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address]);

  // Handle history errors with detailed messages
  const handleHistoryError = (error: any) => {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("user rejected") || errorMessage.includes("user denied")) {
        setError("Transaction cancelled by user");
      } else if (errorMessage.includes("already claimed")) {
        setError("You have already claimed winnings for this market");
      } else if (errorMessage.includes("market not settled")) {
        setError("Market has not been settled yet");
      } else if (errorMessage.includes("network error")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(error.message);
      }
    } else {
      setError("Error fetching history");
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
    
    const winnings = getWinningsAmount(bet);
    if (winnings === BigInt(0)) return "Lost";
    
    // If it's a winning bet and has been claimed, show "Claimed"
    if (bet.claimed) return "Claimed";
    
    // If it's a winning bet and hasn't been claimed, show "Won"
    return "Won";
  };

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

  const getFilteredBets = () => {
    if (activeTab === "claimable") {
      // Show only winning bets that haven't been claimed
      return bets.filter(bet => {
        // Check if market is settled
        if (!bet.market.settled) return false;
        
        // Check if bet was won
        const isWon = bet.isOver 
          ? bet.market.actualPrice > bet.market.aiPrediction
          : bet.market.actualPrice < bet.market.aiPrediction;
        
        // Return true if bet was won and hasn't been claimed
        return isWon && !bet.claimed;
      });
    }
    // Sort by market ID in descending order (newest first)
    return [...bets].sort((a, b) => Number(b.marketId - a.marketId));
  };

  const getPaginatedBets = () => {
    const filteredBets = getFilteredBets();
    const startIndex = (currentPage - 1) * betsPerPage;
    const endIndex = startIndex + betsPerPage;
    return filteredBets.slice(startIndex, endIndex);
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please connect your wallet to view betting history</p>
      </div>
    );
  }

  if (isLoading && bets.length === 0) {
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

  const filteredBets = getFilteredBets();
  if (filteredBets.length === 0) {
    return (
      <div>
        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          <button
            key="claimable-tab"
            onClick={() => setActiveTab("claimable")}
            className={`px-4 py-2 rounded ${
              activeTab === "claimable"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Claimable Winnings
          </button>
          <button
            key="history-tab"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Betting History
          </button>
        </div>

        <div className="text-center py-8">
          <p className="text-gray-600">
            {activeTab === "claimable" 
              ? "No claimable winnings found. Check your betting history to see past bets and claims." 
              : "No betting history found. Place a bet to get started!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          key="claimable-tab"
          onClick={() => setActiveTab("claimable")}
          className={`px-4 py-2 rounded ${
            activeTab === "claimable"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Claimable Winnings
        </button>
        <button
          key="history-tab"
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded ${
            activeTab === "history"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Betting History
        </button>
      </div>

      {/* Bet List */}
      {getPaginatedBets().map((bet) => {
        const status = getBetStatus(bet);
        const winnings = getWinningsAmount(bet);
        const isClaiming = claimingMarketId === bet.marketId;

        // Check if bet was won
        const isWon = bet.market.settled && (
          bet.isOver 
            ? bet.market.actualPrice > bet.market.aiPrediction
            : bet.market.actualPrice < bet.market.aiPrediction
        );

        return (
          <div key={`${bet.marketId}-${bet.isOver ? 'over' : 'under'}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Market #{bet.marketId.toString()}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bet: {ethers.formatEther(bet.amount)} tokens on {bet.isOver ? "Over" : "Under"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AI Prediction: ${ethers.formatEther(bet.market.aiPrediction)}
                </p>
                {bet.market.settled && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Actual Price: ${ethers.formatEther(bet.market.actualPrice)}
                  </p>
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
                {activeTab === "claimable" ? (
                  // Show claim button for winning bets that haven't been claimed
                  isWon && !bet.claimed && (
                    <button
                      onClick={() => handleClaim(bet.marketId)}
                      disabled={isClaiming}
                      className={`mt-2 px-3 py-1 text-sm rounded ${
                        isClaiming
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isClaiming ? "Claiming..." : `Claim ${ethers.formatEther(winnings)} tokens`}
                    </button>
                  )
                ) : (
                  // Show transaction link for claimed bets in history tab
                  bet.claimTxHash && (
                    <a
                      href={getBlockExplorerUrl(bet.claimTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-sm text-blue-500 hover:text-blue-700"
                    >
                      View Transaction
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Pagination Controls */}
      {filteredBets.length > betsPerPage && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 