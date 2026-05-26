"use client"

import { useEffect, useRef, useState } from "react"
import LiveFeed from "@/components/landing/LiveFeed"
import NetworkErrorBanner from "@/components/ui/NetworkErrorBanner"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

const TABS = [
  { label: "BTC/USDT", symbol: "BINANCE:BTCUSDT" },
  { label: "ETH/USDT", symbol: "BINANCE:ETHUSDT" },
  { label: "SOL/USDT", symbol: "BINANCE:SOLUSDT" },
]

function embedTradingView(container: HTMLElement, symbol: string) {
  container.innerHTML = ""
  const iframe = document.createElement("iframe")
  iframe.style.width = "100%"
  iframe.style.height = "100%"
  iframe.style.border = "none"
  iframe.src = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(symbol)}&interval=30&theme=dark&style=1&timezone=Etc%2FUTC&studies=%5B%5D`
  container.appendChild(iframe)
}

export default function TradingDashboard() {
  const [activeLabel, setActiveLabel] = useState("BTC/USDT")
  const [activeSymbol, setActiveSymbol] = useState("BINANCE:BTCUSDT")
  const chartRef = useRef<HTMLDivElement>(null)
  const isOnline = useOnlineStatus()

  useEffect(() => {
    if (chartRef.current) embedTradingView(chartRef.current, activeSymbol)
  }, [activeSymbol])

  return (
    <section className="bg-[#FAFAFA] py-20">
      <div className="mx-auto max-w-[1200px] px-3 md:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[1px] text-[#00B074]">
            Market Performance
          </p>
          <h2 className="mt-3 text-[32px] sm:text-[36px] font-bold text-[#111111] tracking-tight">
            Real-Time AI Execution
          </h2>
        </div>

        <div className="p-2 md:p-5 bg-white rounded-xl border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden mb-[30px]">
          <div className="flex gap-1.5 pb-4">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveLabel(tab.label)
                  setActiveSymbol(tab.symbol)
                }}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors ${
                  activeLabel === tab.label
                    ? "bg-[#00B074] text-white shadow-sm"
                    : "bg-[#F0F0F0] text-[#555] hover:bg-[#E0E0E0]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isOnline ? (
            <div
              ref={chartRef}
              className="h-[380px] rounded-lg overflow-hidden bg-[#131722]"
            />
          ) : (
            <div className="h-[380px] rounded-lg overflow-hidden bg-[#131722] flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p className="mt-3 text-sm text-red-400 font-medium">Network connection lost</p>
                <p className="mt-1 text-xs text-gray-400">Please check your internet connection and try again.</p>
              </div>
            </div>
          )}
        </div>

        <NetworkErrorBanner />

        <LiveFeed />
      </div>
    </section>
  )
}
