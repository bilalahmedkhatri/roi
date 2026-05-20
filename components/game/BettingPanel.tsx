"use client";

import { useState, useEffect } from "react";
import { useGame } from "./GameProvider";

interface BetSlotProps {
  slotNumber: 1 | 2;
}

function BetSlot({ slotNumber }: BetSlotProps) {
  const { state, balance, send, activeBets } = useGame();
  const [amount, setAmount] = useState("");
  const [autoCashout, setAutoCashout] = useState("");
  const [useAuto, setUseAuto] = useState(false);
  const [balanceType, setBalanceType] = useState<"real" | "bonus">("real");
  const [betError, setBetError] = useState("");

  const myBet = activeBets.find(
    (b) => b.userId === "guest" && b.slot === slotNumber
  );

  const isBetting = state?.phase === "betting";
  const isPlaying = state?.phase === "playing";
  const isCrashed = state?.phase === "crashed";
  const canPlace = isBetting && !myBet;

  const currentBalance =
    balanceType === "real" ? balance?.real ?? 0 : balance?.bonus ?? 0;

  const quickAmounts = [10, 25, 50, 100, 500];

  useEffect(() => {
    if (myBet?.status === "cashed") {
      const timer = setTimeout(() => setAmount(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [myBet?.status]);

  function placeBet() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setBetError("Enter a valid amount");
      return;
    }
    if (amt > currentBalance) {
      setBetError("Insufficient balance");
      return;
    }
    setBetError("");

    send({
      type: "place_bet",
      wagerAmount: amt,
      balanceType,
      autoCashoutAt: useAuto ? parseFloat(autoCashout) || null : null,
      slot: slotNumber,
    });
  }

  function cashOut() {
    if (myBet && myBet.status === "placed") {
      send({ type: "cashout", betId: myBet.id, slot: slotNumber });
    }
  }

  return (
    <div className="rounded-xl bg-[#1a2332] border border-[#2a3a4a] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Bet {slotNumber}
        </span>
        <span className="text-xs text-gray-500">
          Bal: ${currentBalance.toFixed(2)}
        </span>
      </div>

      <div className="relative">
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setBetError("");
          }}
          placeholder="Bet amount"
          disabled={!canPlace}
          className="w-full bg-[#0d1520] text-white text-lg font-bold rounded-lg px-4 py-3 pr-12 border border-[#2a3a4a] focus:border-[#00ff88] focus:outline-none transition-colors disabled:opacity-40"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
          $
        </span>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {quickAmounts.map((q) => (
          <button
            key={q}
            onClick={() => {
              setAmount(q.toString());
              setBetError("");
            }}
            disabled={!canPlace}
            className="flex-1 min-w-[48px] text-xs py-1.5 rounded-md bg-[#0d1520] text-gray-400 hover:bg-[#1a2a3a] hover:text-white transition-colors disabled:opacity-40 border border-[#1a2a3a]"
          >
            ${q}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setBalanceType("real")}
          disabled={!canPlace}
          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors disabled:opacity-40 ${
            balanceType === "real"
              ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40"
              : "bg-[#0d1520] text-gray-500 border border-[#1a2a3a] hover:text-gray-300"
          }`}
        >
          Real
        </button>
        <button
          onClick={() => setBalanceType("bonus")}
          disabled={!canPlace || (balance?.bonus ?? 0) <= 0}
          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors disabled:opacity-40 ${
            balanceType === "bonus"
              ? "bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40"
              : "bg-[#0d1520] text-gray-500 border border-[#1a2a3a] hover:text-gray-300"
          }`}
        >
          Bonus
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`auto-${slotNumber}`}
          checked={useAuto}
          onChange={() => setUseAuto(!useAuto)}
          disabled={!canPlace}
          className="accent-[#00ff88] disabled:opacity-40"
        />
        <label
          htmlFor={`auto-${slotNumber}`}
          className="text-xs text-gray-400 disabled:opacity-40"
        >
          Auto cashout
        </label>
        {useAuto && (
          <input
            type="number"
            value={autoCashout}
            onChange={(e) => setAutoCashout(e.target.value)}
            placeholder="1.50"
            step="0.01"
            min="1.01"
            disabled={!canPlace}
            className="w-20 bg-[#0d1520] text-white text-xs rounded-lg px-3 py-1.5 border border-[#2a3a4a] focus:border-[#f59e0b] focus:outline-none transition-colors disabled:opacity-40"
          />
        )}
      </div>

      {betError && (
        <p className="text-red-400 text-xs">{betError}</p>
      )}

      {isPlaying && myBet?.status === "placed" && (
        <button
          onClick={cashOut}
          className="w-full py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black hover:from-[#00dd77] hover:to-[#00aa55] transition-all active:scale-95"
        >
          Cash Out{myBet ? ` (${(myBet.wagerAmount * (state?.currentMultiplier ?? 1)).toFixed(2)})` : ""}
        </button>
      )}

      {canPlace && (
        <button
          onClick={placeBet}
          className="w-full py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-[#0055ff] to-[#0033cc] text-white hover:from-[#0044dd] hover:to-[#0022aa] transition-all active:scale-95 disabled:opacity-40"
        >
          Place Bet
        </button>
      )}

      {isCrashed && myBet && (
        <div
          className={`text-center text-sm font-bold py-2 rounded-lg ${
            myBet.status === "cashed"
              ? "bg-green-900/30 text-green-400"
              : "bg-red-900/30 text-red-400"
          }`}
        >
          {myBet.status === "cashed"
            ? `Won $${myBet.payoutAmount.toFixed(2)}`
            : `Lost $${myBet.wagerAmount.toFixed(2)}`}
        </div>
      )}

      {myBet && myBet.status === "lost" && (
        <div className="text-center text-xs text-red-500/60">
          Crash at {state?.crashMultiplier?.toFixed(2)}x
        </div>
      )}
    </div>
  );
}

export default function BettingPanel() {
  const { state } = useGame();

  const cooldownLeft =
    state?.phase === "cooldown" && state.cooldownEndAt
      ? Math.max(0, Math.floor((state.cooldownEndAt - Date.now()) / 1000))
      : null;

  const bettingLeft =
    state?.phase === "betting" && state.bettingEndAt
      ? Math.max(0, Math.floor((state.bettingEndAt - Date.now()) / 1000))
      : null;

  return (
    <div className="flex flex-col gap-3">
      {(cooldownLeft !== null || bettingLeft !== null) && (
        <div className="text-center py-2 text-sm font-mono">
          {bettingLeft !== null ? (
            <span className="text-[#f59e0b]">
              Betting closes in{" "}
              <span className="text-xl font-bold">{bettingLeft}s</span>
            </span>
          ) : cooldownLeft !== null ? (
            <span className="text-gray-500">
              Next round in{" "}
              <span className="text-xl font-bold text-white">
                {cooldownLeft}s
              </span>
            </span>
          ) : null}
        </div>
      )}

      <BetSlot slotNumber={1} />
      <BetSlot slotNumber={2} />
    </div>
  );
}
