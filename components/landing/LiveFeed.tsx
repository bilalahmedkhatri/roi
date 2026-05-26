"use client"

import { useEffect, useRef, useState, useCallback } from "react"

type TradeRow = {
  id: number
  time: string
  pair: string
  actionBadge: string
  user: string
  profitCell: string
}

const PAIRS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "NEAR/USDT", "XRP/USDT"]

let rowId = 0

function randomUser() {
  return "USR-" + Math.random().toString(36).substring(2, 7).toUpperCase()
}

function generateRow(): TradeRow {
  const now = new Date()
  const time = now.toTimeString().slice(0, 8)
  const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)]
  const isBuy = Math.random() > 0.4
  const amount = Math.floor(Math.random() * 2500) + 500
  const isOptimize = Math.random() > 0.85
  const user = randomUser()

  let actionBadge: string
  let profitCell: string

  if (isOptimize) {
    actionBadge =
      '<span style="background:#e6f7ff;color:#1890ff;padding:2px 6px;border-radius:4px;font-size:12px;font-weight:600">OPTIMIZE</span>'
    profitCell =
      '<span style="color:#8c8c8c;font-style:italic">Protection active</span>'
  } else if (isBuy) {
    actionBadge = `<span style="background:#e6f7ff;color:#1890ff;padding:2px 6px;border-radius:4px;font-size:12px;font-weight:600">BUY: $${amount}</span>`
    profitCell = `<span style="color:#52c41a;font-weight:600">+${(Math.random() * 3.5 + 0.2).toFixed(2)}% Profit</span>`
  } else {
    actionBadge = `<span style="background:#fff1f0;color:#f5222d;padding:2px 6px;border-radius:4px;font-size:12px;font-weight:600">SELL: $${amount}</span>`
    profitCell = `<span style="color:#52c41a;font-weight:600">+${(Math.random() * 2.8 + 0.1).toFixed(2)}% Profit</span>`
  }

  return { id: rowId++, time, pair, actionBadge, user, profitCell }
}

export default function LiveFeed() {
  const [rows, setRows] = useState<TradeRow[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const addRow = useCallback(() => {
    const r = generateRow()
    setRows((prev) => [r, ...prev].slice(0, 7))
    const delay = Math.floor(Math.random() * 3000) + 3000
    timerRef.current = setTimeout(addRow, delay)
  }, [])

  useEffect(() => {
    const seed: TradeRow[] = []
    for (let i = 0; i < 5; i++) seed.push(generateRow())
    setRows(seed)

    const delay = Math.floor(Math.random() * 3000) + 3000
    timerRef.current = setTimeout(addRow, delay)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [addRow])

  if (!isOnline) {
    return (
      <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#EAEAEA]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-live" />
          <h3 className="font-semibold text-[15px] text-[#111111]">
            Live Strategy Execution Feed
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg className="w-14 h-14 text-red-400 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-[#8c8c8c] font-semibold text-sm">Network connection lost</p>
          <p className="text-[#8c8c8c] text-xs mt-1">Please check your internet connection and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#EAEAEA]">
        <span className="w-2 h-2 rounded-full bg-[#00B074] animate-pulse-live" />
        <h3 className="font-semibold text-[15px] text-[#111111]">
          Live Strategy Execution Feed
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[450px]">
          <thead>
            <tr className="text-[11px] text-[#8c8c8c] font-medium uppercase tracking-wider">
              <th className="text-left py-3 pr-2 w-[120px]">TIME</th>
              <th className="text-left py-3 pr-2 w-[180px]">PAIR</th>
              <th className="text-left py-3 pr-2 w-[200px]">ACTION</th>
              <th className="text-left py-3 pr-2 w-[250px]">USER</th>
              <th className="text-right py-3 w-[120px]">P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#F5F5F5] animate-row-fade"
              >
                <td className="w-[120px] py-3 pr-2 text-gray-800 text-[11px] md:text-[14px]">
                  {row.time}
                </td>
                <td className="w-[180px] py-3 pr-2 text-[#111111] font-semibold text-[11px] md:text-[14px]">
                  {row.pair}
                </td>
                <td
                  className="w-[200px] py-3 pr-2 text-[11px] md:text-[14px]"
                  dangerouslySetInnerHTML={{ __html: row.actionBadge }}
                />
                <td className="w-[250px] py-3 pr-2 font-mono text-[11px] md:text-[14px] text-gray-800">
                  {row.user}
                </td>
                <td
                  className="w-[220px] py-3 text-right text-[11px] md:text-[14px]"
                  dangerouslySetInnerHTML={{ __html: row.profitCell }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
