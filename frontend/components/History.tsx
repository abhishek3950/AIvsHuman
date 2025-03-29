"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getUserBets, claimWinnings, UserBets } from "@/utils/contract";

export function History() {
  const [address, setAddress] = useState<string | null>(null);
  const [userBets, setUserBets] = useState<UserBets | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Connect wallet
  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAddress(accounts[0]);
        } catch (error) {
          console.error('Error connecting wallet:', error);
        }
      }
    };
    connectWallet();
  }, []);

  // Fetch user's bets
  useEffect(() => {
    const fetchUserBets = async () => {
      if (!address) return;

      try {
        const data = await getUserBets(BigInt(0), address); // Replace 0 with actual market ID
        setUserBets(data);
      } catch (error) {
        console.error('Error fetching user bets:', error);
      }
    };

    fetchUserBets();
    const interval = setInterval(fetchUserBets, 15000);
    return () => clearInterval(interval);
  }, [address]);

  const handleClaim = async (marketId: bigint) => {
    if (!address) return;

    try {
      setIsClaiming(true);
      await claimWinnings(marketId);
      // Refresh user bets after claiming
      const data = await getUserBets(marketId, address);
      setUserBets(data);
    } catch (error) {
      console.error("Error claiming winnings:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!address) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Betting History
        </h2>
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400">Please connect your wallet to view betting history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Betting History
      </h2>

      <div className="space-y-4">
        {userBets ? (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Market ID: 0
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userBets.hasClaimed ? "Claimed" : "Not Claimed"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Over Bet</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {ethers.formatEther(userBets.overBet)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Under Bet</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {ethers.formatEther(userBets.underBet)}
                </p>
              </div>
            </div>
            {!userBets.hasClaimed && (
              <button
                onClick={() => handleClaim(BigInt(0))}
                disabled={isClaiming}
                className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaiming ? "Claiming..." : "Claim Winnings"}
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No betting history found</p>
        )}
      </div>
    </div>
  );
} 