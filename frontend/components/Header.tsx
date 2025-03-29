"use client";

import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@/hooks/useWallet";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { address, connectWallet, isConnecting, error } = useWallet();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Over or Under
            </h1>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-gray-100" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-900" />
              )}
            </button>
          </div>
          <div>
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : address ? (
              <p className="text-gray-900 dark:text-white">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 