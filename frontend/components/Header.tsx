"use client";

import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@/hooks/useWallet";
import Link from "next/link";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { address, isConnecting, error, connectWallet } = useWallet();

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              Over or Under
            </Link>
            <Link href="/faucet" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Faucet
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            {!address ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isConnecting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </header>
  );
} 