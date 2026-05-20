"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { supabase } from "@/lib/supabase/client";
import { detectPakistan, formatBalance, formatAmount } from "@/lib/country";

export default function DashboardPage() {
  const isPK = detectPakistan();
  const searchParams = useSearchParams();
  const [isVerified, setIsVerified] = useState(true);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [summary, setSummary] = useState<{
    balance: number;
    todayEarnings: number;
    totalEarnings: number;
    activeInvestments: number;
    hasPendingDeposit: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyParam = searchParams.get("verify");
    if (verifyParam === "true") setShowVerifyBanner(true);

    Promise.all([
      supabase.rpc("get_dashboard_summary").single(),
      supabase.auth.getUser(),
    ]).then(([summaryRes, { data: { user } }]) => {
      if (summaryRes.data) setSummary(summaryRes.data as any);
      if (!user?.email_confirmed_at) setIsVerified(false);
      setLoading(false);
    });
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">Your portfolio at a glance</p>
        </div>
      </div>

      {showVerifyBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-emerald-800">Account created successfully!</p>
        </div>
      )}

      {!isVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <div>
            <p className="font-medium text-amber-800">Email not verified</p>
            <p className="text-xs text-amber-700 mt-0.5">Verify your email to enable deposits, withdrawals, and referral rewards.</p>
          </div>
        </div>
      )}

      {summary?.hasPendingDeposit && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-amber-800">Your deposit is being confirmed. This usually takes 2-5 minutes.</p>
        </div>
      )}

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Current Balance" value={formatBalance(summary.balance, isPK)} change="Live" />
          <StatCard label="Today's Earnings" value={formatAmount(summary.todayEarnings, isPK)} change={formatAmount(summary.todayEarnings, isPK)} />
          <StatCard label="Total Earnings" value={formatBalance(summary.totalEarnings, isPK)} change={formatAmount(summary.totalEarnings, isPK)} />
          <StatCard label="Active Investments" value={String(summary.activeInvestments)} change={`${summary.activeInvestments} plans`} />
        </div>
      )}

      {/* Market Prices */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-sm">Market Prices</h2>
          <p className="text-xs text-muted">Live from global exchanges</p>
          <MarketPrices />
        </Card>

        <Card>
          <h2 className="font-semibold text-sm">Top Traders</h2>
          <p className="text-xs text-muted">Platform leaders this month</p>
          <div className="mt-4 space-y-2">
            {[
              { rank: 1, name: "CryptoWhale", profit: "+245.6%" },
              { rank: 2, name: "AI_Trader", profit: "+189.3%" },
              { rank: 3, name: "BlockFund", profit: "+156.7%" },
            ].map((t) => (
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
        <RecentActivity />
      </Card>

      <p className="text-center text-xs text-muted">* Returns depend on market conditions and are not guaranteed.</p>
    </div>
  );
}

function MarketPrices() {
  const [prices, setPrices] = useState<{ sym: string; name: string; price: number; chg: number }[]>([]);

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd&include_24hr_change=true"
    )
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, { name: string; sym: string }> = {
          bitcoin: { name: "Bitcoin", sym: "BTC" },
          ethereum: { name: "Ethereum", sym: "ETH" },
          solana: { name: "Solana", sym: "SOL" },
          binancecoin: { name: "BNB", sym: "BNB" },
        };
        setPrices(
          Object.entries(d).map(([k, v]: [string, any]) => ({
            sym: map[k]?.sym || k,
            name: map[k]?.name || k,
            price: v.usd,
            chg: v.usd_24h_change || 0,
          }))
        );
      })
      .catch(() => {});
  }, []);

  if (prices.length === 0) {
    return <div className="mt-4 text-sm text-muted">Loading prices...</div>;
  }

  return (
    <div className="mt-4 space-y-2">
      {prices.slice(0, 4).map((c) => (
        <div key={c.sym} className="flex items-center justify-between rounded-xl bg-surface border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium">{c.name}</p>
            <p className="text-xs text-muted">{c.sym}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">${c.price.toLocaleString()}</p>
            <p className={`text-xs font-medium ${c.chg >= 0 ? "text-primary" : "text-red-400"}`}>
              {c.chg >= 0 ? "+" : ""}{c.chg.toFixed(2)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentActivity() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    supabase.rpc("get_user_transactions", { p_page_size: 5, p_page_number: 1 }).then(({ data }) => {
      if (data) setRows(data);
    });
  }, []);

  if (rows.length === 0) {
    return <div className="mt-4 text-sm text-muted">No recent activity</div>;
  }

  return (
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
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="py-3 text-sm">{r.row_type}</td>
              <td className="py-3 text-sm font-medium">
                {r.row_type === "Withdrawal" ? "-" : "+"}${Number(r.amount).toFixed(2)}
              </td>
              <td className="py-3"><StatusBadge status={r.status} /></td>
              <td className="py-3 text-right text-sm text-muted">{r.row_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
