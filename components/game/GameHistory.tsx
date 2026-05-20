"use client";

import { useMemo } from "react";
import { useGame } from "./GameProvider";

function getMultiplierColor(m: number): string {
  if (m < 2) return "bg-gray-700 text-gray-300";
  if (m < 5) return "bg-blue-900/60 text-blue-400";
  if (m < 10) return "bg-purple-900/60 text-purple-400";
  if (m < 20) return "bg-pink-900/60 text-pink-400";
  if (m < 50) return "bg-orange-900/60 text-orange-400";
  return "bg-yellow-900/60 text-yellow-300";
}

function getMultiplierBadge(m: number): string {
  if (m < 2) return "text-gray-400";
  if (m < 5) return "text-blue-400";
  if (m < 10) return "text-purple-400";
  if (m < 20) return "text-pink-400";
  if (m < 50) return "text-orange-400";
  return "text-yellow-300";
}

export default function GameHistory() {
  const { history, state } = useGame();

  const displayHistory = useMemo(() => {
    const items = [...history].slice(0, 20);
    return items;
  }, [history]);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-3 custom-scrollbar">
      {state?.phase === "crashed" && state.crashMultiplier && (
        <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-900/40 border border-red-500/30 animate-pulse">
          <span className="text-xs font-bold text-red-400">
            {state.crashMultiplier.toFixed(2)}x
          </span>
        </div>
      )}

      {displayHistory.map((entry, i) => (
        <div
          key={`${entry.roundNumber}-${i}`}
          className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-bold ${getMultiplierColor(
            entry.crashMultiplier
          )} ${
            i === 0
              ? "ring-1 ring-white/10"
              : ""
          }`}
          title={`Round #${entry.roundNumber}`}
        >
          {entry.crashMultiplier.toFixed(2)}x
        </div>
      ))}
    </div>
  );
}
