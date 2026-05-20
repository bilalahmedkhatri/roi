"use client";

import { useMemo } from "react";
import { useGame } from "./GameProvider";

export default function LiveBetBoard() {
  const { activeBets, state } = useGame();

  const sortedBets = useMemo(() => {
    const bets = [...activeBets];
    bets.sort((a, b) => {
      if (a.status === "cashed" && b.status !== "cashed") return -1;
      if (a.status !== "cashed" && b.status === "cashed") return 1;
      return b.createdAt - a.createdAt;
    });
    return bets;
  }, [activeBets]);

  return (
    <div className="rounded-xl bg-[#1a2332] border border-[#2a3a4a] p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Live Bets
        </h3>
        <span className="text-[10px] text-gray-500">
          {activeBets.length} player{activeBets.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-shrink-0 grid grid-cols-3 gap-2 text-[10px] text-gray-500 pb-2 border-b border-[#2a3a4a] mb-2">
        <span>Player</span>
        <span className="text-center">Bet</span>
        <span className="text-right">Payout</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        {sortedBets.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-8">
            No bets this round
          </div>
        )}

        {sortedBets.map((bet) => (
          <div
            key={bet.id}
            className={`grid grid-cols-3 gap-2 text-xs py-1.5 px-2 rounded-lg transition-colors ${
              bet.status === "cashed"
                ? "bg-green-900/20 text-green-400"
                : bet.status === "lost"
                ? "bg-red-900/20 text-red-400"
                : state?.phase === "playing"
                ? "bg-blue-900/20 text-blue-300"
                : "text-gray-400"
            }`}
          >
            <span className="truncate font-medium">{bet.username}</span>
            <span className="text-center">${bet.wagerAmount.toFixed(2)}</span>
            <span className="text-right font-bold">
              {bet.status === "cashed"
                ? `${bet.cashoutMultiplier?.toFixed(2)}x $${bet.payoutAmount.toFixed(2)}`
                : bet.status === "lost"
                ? "Lost"
                : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
