"use client";

import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { detectPakistan, formatBalance, formatAmount } from "@/lib/country";

const data = {
  balance: 15750.42,
  todayEarnings: 43.21,
  totalEarnings: 3240.85,
  activeInvestments: 3,
  depositProcessing: true,
  prices: [
    { sym: "BTC", name: "Bitcoin", price: 67542.10, chg: 2.34 },
    { sym: "ETH", name: "Ethereum", price: 3456.78, chg: -1.23 },
    { sym: "SOL", name: "Solana", price: 142.56, chg: 5.67 },
    { sym: "BNB", name: "BNB", price: 567.89, chg: 0.89 },
  ],
  traders: [
    { rank: 1, name: "CryptoWhale", profit: "+245.6%" },
    { rank: 2, name: "AI_Trader", profit: "+189.3%" },
    { rank: 3, name: "BlockFund", profit: "+156.7%" },
  ],
  activity: [
    { type: "Earnings", amount: "+$43.21", status: "completed", date: "Today" },
    { type: "Deposit", amount: "$500.00", status: "completed", date: "Yesterday" },
    { type: "Earnings", amount: "+$38.50", status: "completed", date: "2 days ago" },
    { type: "Withdrawal", amount: "$200.00", status: "processing", date: "3 days ago" },
    { type: "Deposit", amount: "$250.00", status: "completed", date: "4 days ago" },
    { type: "Earnings", amount: "+$41.20", status: "completed", date: "5 days ago" },
  ],
};

export default function DashboardPage() {
  const isPK = detectPakistan();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">Your portfolio at a glance</p>
        </div>
      </div>

      {data.depositProcessing && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-amber-800">Deposit Processing</p>
            <p className="text-xs text-amber-700">Your deposit is being confirmed. This usually takes 2-5 minutes.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current Balance" value={formatBalance(data.balance, isPK)} change="+2.4%" />
        <StatCard label="Today's Earnings" value={formatAmount(data.todayEarnings, isPK)} change={formatAmount(data.todayEarnings, isPK)} />
        <StatCard label="Total Earnings" value={formatBalance(data.totalEarnings, isPK)} change={formatAmount(data.totalEarnings, isPK)} />
        <StatCard label="Active Investments" value={String(data.activeInvestments)} change="3 plans" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-sm">Market Prices</h2>
          <p className="text-xs text-muted">Live from global exchanges</p>
          <div className="mt-4 space-y-2">
            {data.prices.map((c) => (
              <div key={c.sym} className="flex items-center justify-between rounded-xl bg-surface border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted">{c.sym}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${c.price.toLocaleString()}</p>
                  <p className={`text-xs font-medium ${c.chg >= 0 ? "text-primary" : "text-red-400"}`}>
                    {c.chg >= 0 ? "+" : ""}{c.chg}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-sm">Top Traders</h2>
          <p className="text-xs text-muted">Platform leaders this month</p>
          <div className="mt-4 space-y-2">
            {data.traders.map((t) => (
              <div key={t.rank} className="flex items-center justify-between rounded-xl bg-surface border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-border text-xs font-bold text-muted">
                    {t.rank}
                  </span>
                  <p className="text-sm font-medium">{t.name}</p>
                </div>
                <p className="text-sm font-medium text-primary">{t.profit}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-sm">Recent Activity</h2>
        <p className="text-xs text-muted">Latest transactions</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Type</th>
                <th className="pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Amount</th>
                <th className="pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Status</th>
                <th className="pb-3 text-right font-medium text-muted text-xs uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.activity.slice(0, 5).map((r, i) => (
                <tr key={i}>
                  <td className="py-3 text-sm">{r.type}</td>
                  <td className="py-3 text-sm font-medium">{r.amount}</td>
                  <td className="py-3"><StatusBadge status={r.status} /></td>
                  <td className="py-3 text-right text-sm text-muted">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-center text-xs text-muted">* Returns depend on market conditions and are not guaranteed.</p>
    </div>
  );
}
