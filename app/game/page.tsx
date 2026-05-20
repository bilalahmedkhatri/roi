"use client";

import { GameProvider } from "@/components/game/GameProvider";
import GameCanvas from "@/components/game/GameCanvas";
import BettingPanel from "@/components/game/BettingPanel";
import LiveBetBoard from "@/components/game/LiveBetBoard";
import GameHistory from "@/components/game/GameHistory";
import ConnectionStatus from "@/components/game/ConnectionStatus";
import SoundToggle from "@/components/game/SoundToggle";
import { useGame } from "@/components/game/GameProvider";

function GameContent() {
  const { state, balance } = useGame();

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <header className="border-b border-[#1a2332]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent flex-shrink-0">
              Aviator
            </h1>
            <div className="hidden md:block flex-shrink min-w-0">
              <GameHistory />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-xs md:text-sm">
              <span className="text-gray-500 hidden sm:inline">Balance: </span>
              <span className="text-[#00ff88] font-bold">
                ${(balance?.real ?? 0).toFixed(2)}
              </span>
            </div>
            <SoundToggle />
            <ConnectionStatus />
          </div>
        </div>
        <div className="md:hidden px-4 pb-2">
          <GameHistory />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          <div className="flex-1 min-w-0 order-1">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-[#1a2332] bg-[#0f1923]">
              <GameCanvas />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 md:gap-3">
              {[
                { label: "Round", value: `#${state?.roundNumber ?? 0}` },
                { label: "Players", value: `${state?.totalBets ?? 0}` },
                { label: "Total Wagered", value: `$${(state?.totalWagered ?? 0).toFixed(2)}` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#1a2332] rounded-xl border border-[#2a3a4a] px-3 md:px-4 py-2 md:py-3"
                >
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </div>
                  <div className="text-base md:text-lg font-bold text-white mt-0.5">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-72 flex-shrink-0 order-3 lg:order-2">
            <BettingPanel />
          </div>

          <div className="w-full lg:w-60 xl:w-64 flex-shrink-0 order-2 lg:order-3 h-48 lg:h-auto">
            <LiveBetBoard />
          </div>
        </div>

        <div className="mt-4 border border-[#1a2332] rounded-xl bg-[#0f1923]/50 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Game Settings
          </h3>
          <div className="text-[11px] text-gray-500 space-y-1">
            <p>House Edge: <span className="text-gray-400 font-mono">3%</span></p>
            <p>Provably Fair: <span className="text-[#00ff88] font-mono">HMAC-SHA512</span></p>
            <p>Growth Rate: <span className="text-gray-400 font-mono">e^(0.06t)</span></p>
            <p>Auto cashouts and manual cashouts are processed server-side at the exact multiplier.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GamePage() {
  return (
    <GameProvider userId="demo-player-1" username="PlayerOne">
      <GameContent />
    </GameProvider>
  );
}
