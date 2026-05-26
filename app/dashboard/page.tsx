"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Toast from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase/client";
import { detectPakistan, formatBalance, formatAmount } from "@/lib/country";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import NetworkErrorBanner from "@/components/ui/NetworkErrorBanner";

export default function DashboardPage() {
  const isOnline = useOnlineStatus();
  const isPK = detectPakistan();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerified, setIsVerified] = useState(true);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [verifyToast, setVerifyToast] = useState(false);
  const [summary, setSummary] = useState<{
    balance: number;
    todayEarnings: number;
    totalEarnings: number;
    activeInvestments: number;
    hasPendingDeposit: boolean;
  } | null>(null);

  const clearVerify = useCallback(() => {
    router.replace("/dashboard");
  }, [router]);

  useEffect(() => {
    const verifyParam = searchParams.get("verify");
    if (verifyParam === "true") {
      setShowVerifyBanner(true);
      setVerifyToast(true);
    }

    Promise.all([
      supabase.rpc("get_dashboard_summary").single(),
      supabase.auth.getUser(),
    ])
      .then(([summaryRes, { data: { user } }]) => {
        if (summaryRes.data) {
          const d = summaryRes.data as any;
          setSummary({
            balance: Number(d.balance),
            todayEarnings: Number(d.today_earnings),
            totalEarnings: Number(d.total_earnings),
            activeInvestments: Number(d.active_investments),
            hasPendingDeposit: Boolean(d.has_pending_deposit),
          });
        } else {
          setSummary({ balance: 0, todayEarnings: 0, totalEarnings: 0, activeInvestments: 0, hasPendingDeposit: false });
        }
        if (!user?.email_confirmed_at) setIsVerified(false);
      })
      .catch(() => setSummary({ balance: 0, todayEarnings: 0, totalEarnings: 0, activeInvestments: 0, hasPendingDeposit: false }));
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <NetworkErrorBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">Your portfolio at a glance</p>
        </div>
      </div>

      {verifyToast && (
        <Toast
          message="Account created! Please check your email to verify your account."
          type="success"
          onClose={() => { setVerifyToast(false); clearVerify(); }}
          duration={6000}
        />
      )}

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
          <p className="text-xs text-muted">Daily profit leaders</p>
          <div className="mt-4 space-y-2">
            {[
              { rank: 1, name: "QuantKing", profit: "+134.2%", trades: 29, winRate: "94%", earned: "$3.8K" },
              { rank: 2, name: "NeoTrader", profit: "+129.8%", trades: 24, winRate: "91%", earned: "$2.9K" },
              { rank: 3, name: "AlphaBot", profit: "+125.4%", trades: 22, winRate: "89%", earned: "$2.4K" },
              { rank: 4, name: "CryptoSage", profit: "+121.7%", trades: 18, winRate: "87%", earned: "$1.9K" },
              { rank: 5, name: "SignalPro", profit: "+117.3%", trades: 14, winRate: "85%", earned: "$1.5K" },
              { rank: 6, name: "TrendFox", profit: "+112.8%", trades: 10, winRate: "82%", earned: "$1.1K" },
            ].map((t) => (
              <div key={t.rank} className="flex items-center justify-between rounded-xl bg-surface border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-border text-xs font-bold text-muted">
                    {t.rank}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted">{t.trades} trades · {t.winRate} win</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{t.profit}</p>
                  <p className="text-xs text-muted">{t.earned}</p>
                </div>
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://widgets.tradingview-widget.com/w/en/tv-market-summary.js";
    script.type = "module";
    script.async = true;

    const widget = document.createElement("tv-market-summary");
    widget.setAttribute("symbol-sectors", JSON.stringify([{ sectionName: "Crypto", symbols: ["BITSTAMP:BTCUSD", "BITSTAMP:ETHUSD", "CRYPTOCAP:SOL"] }]));
    widget.setAttribute("show-time-range", "");
    widget.setAttribute("direction", "vertical");
    widget.setAttribute("item-size", "compact");
    widget.setAttribute("mode", "custom");

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);
    containerRef.current.appendChild(widget);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="mt-4 min-h-[300px]" />;
}

function RecentActivity() {
  const isPK = detectPakistan();
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
                {r.row_type === "Withdrawal" ? "-" : "+"}{formatAmount(Number(r.amount), isPK)}
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
