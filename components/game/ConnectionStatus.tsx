"use client";

import { useGame } from "./GameProvider";
import { useState } from "react";

export default function ConnectionStatus() {
  const { connected, state } = useGame();
  const [showVerify, setShowVerify] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const { roundResult } = useGame();

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowVerify(true)}
          className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
        >
          Provably Fair
        </button>

        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-red-500"
            }`}
          />
          <span className="text-[10px] text-gray-500">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {showVerify && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowVerify(false)}
        >
          <div
            className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">
              Provably Fair
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Each round&apos;s crash point is determined before it starts using
              an HMAC-SHA512 chain. The server seed hash is published before the
              round begins, and the seed is revealed after the crash.
            </p>

            {roundResult ? (
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-gray-500 block mb-1">Server Seed</label>
                  <div className="bg-[#0d1520] text-green-400 rounded-lg p-2 break-all">
                    {roundResult.serverSeed}
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Client Seed</label>
                  <div className="bg-[#0d1520] text-blue-400 rounded-lg p-2 break-all">
                    {roundResult.clientSeed}
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Nonce</label>
                  <div className="bg-[#0d1520] text-yellow-400 rounded-lg p-2">
                    {roundResult.nonce}
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Crash Multiplier</label>
                  <div className="bg-[#0d1520] text-[#00ff88] rounded-lg p-2 font-bold text-base">
                    {roundResult.crashMultiplier.toFixed(2)}x
                  </div>
                </div>
                <button
                  onClick={() => setShowResult(!showResult)}
                  className="w-full text-center text-[#00ff88] hover:text-[#00cc6a] transition-colors py-2 text-xs"
                >
                  {showResult ? "Hide" : "Show"} verification formula
                </button>
                {showResult && (
                  <div className="bg-[#0d1520] text-gray-400 rounded-lg p-3 text-[10px] leading-relaxed">
                    <p>1. HMAC_SHA512(serverSeed, &quot;{roundResult.clientSeed}:{roundResult.nonce}&quot;)</p>
                    <p>2. Take first 13 hex chars → convert to integer X</p>
                    <p>3. If X % 33 == 0 → crash at 1.00x (house win)</p>
                    <p>4. Else: floor(97 × 2⁵² / (100 × (2⁵² - X))) / 100</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No completed round data available yet.
              </p>
            )}

            <button
              onClick={() => setShowVerify(false)}
              className="w-full mt-4 py-2.5 rounded-lg bg-[#0d1520] text-gray-300 hover:text-white border border-[#2a3a4a] transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
