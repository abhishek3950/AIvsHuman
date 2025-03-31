import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { NetworkStatus } from "@/components/NetworkStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Over or Under - BTC Price Prediction",
  description: "Bet on whether BTC price will go over or under the AI prediction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <NetworkStatus />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 