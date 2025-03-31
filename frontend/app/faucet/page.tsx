"use client";

import { Faucet } from "@/components/Faucet";

export default function FaucetPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Token Faucet</h1>
        <Faucet />
      </div>
    </div>
  );
} 