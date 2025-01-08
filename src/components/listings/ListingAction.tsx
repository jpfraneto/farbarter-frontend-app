"use client";

import { useState } from "react";

interface ListingActionProps {
  isActive: boolean;
  remainingSupply: number;
  name: string;
  onPurchase?: () => Promise<void>;
}

export function ListingAction({
  isActive,
  remainingSupply,
  name,
  onPurchase,
}: ListingActionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!onPurchase) return;

    try {
      setIsLoading(true);
      await onPurchase();
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive) {
    return (
      <div className="text-center font-mono text-red-400">
        THIS LISTING IS NO LONGER ACTIVE
      </div>
    );
  }

  if (remainingSupply === 0) {
    return (
      <div className="text-center font-mono text-yellow-400">SOLD OUT</div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePurchase}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg 
                font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all 
                disabled:opacity-50 disabled:pointer-events-none
                hover:from-cyan-600 hover:to-blue-600 active:scale-[0.99]"
      aria-label={`Purchase ${name}`}
    >
      <span className="font-mono">
        {isLoading ? "PROCESSING..." : "PURCHASE NOW"}
      </span>
    </button>
  );
}
