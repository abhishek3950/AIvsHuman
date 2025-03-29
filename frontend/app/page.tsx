"use client";

import { useAccount, useConnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BettingInterface } from "@/components/BettingInterface";
import { Header } from "@/components/Header";
import { History } from "@/components/History";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
              Welcome to Over or Under
            </h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
              Connect your wallet to start predicting BTC price movements
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BettingInterface />
            </div>
            <div>
              <History />
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 