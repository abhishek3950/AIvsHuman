"use client";

import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { formatEther } from "viem";

export function History() {
  const { address } = useAccount();

  // Read user's past bets
  const { data: userBets } = useContractRead({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: [], // Add contract ABI here
    functionName: "getUserBets",
    args: [0, address], // Replace 0 with actual market ID
  });

  // Claim winnings function
  const { write: claimWinnings } = useContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: [], // Add contract ABI here
    functionName: "claimWinnings",
  });

  const handleClaim = async (marketId: number) => {
    try {
      await claimWinnings({
        args: [marketId],
      });
    } catch (error) {
      console.error("Error claiming winnings:", error);
    }
  };

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
                  {formatEther(userBets.overBet)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Under Bet</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatEther(userBets.underBet)}
                </p>
              </div>
            </div>
            {!userBets.hasClaimed && (
              <button
                onClick={() => handleClaim(0)}
                className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Claim Winnings
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