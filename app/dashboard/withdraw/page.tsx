"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";
import { detectPakistan, formatBalance } from "@/lib/country";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import NetworkErrorBanner from "@/components/ui/NetworkErrorBanner";

export default function WithdrawPage() {
  const isPK = detectPakistan();
  const isOnline = useOnlineStatus();
  const [isVerified, setIsVerified] = useState(true);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [lastMethod, setLastMethod] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email_confirmed_at) setIsVerified(false);
      const { data: profile } = await supabase
        .from("users")
        .select("balance, last_deposit_method")
        .eq("auth_id", user?.id)
        .single();
      if (profile) {
        setBalance(Number(profile.balance));
        setLastMethod(profile.last_deposit_method || "");
      }
    };
    load();
  }, []);

  const isCrypto = lastMethod === "Crypto";
  const num = parseFloat(amount) || 0;
  const valid = num > 0 && num <= balance && (!isCrypto || cryptoAddress.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError("");
    setSubmitting(true);

    const { error: rpcError } = await supabase.rpc("submit_withdrawal", {
      p_amount: num,
      p_crypto_address: isCrypto ? cryptoAddress.trim() : null,
    });

    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <NetworkErrorBanner />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Withdraw</h1>
          <p className="text-sm text-muted">Withdraw your funds</p>
        </div>
        <Card>
          <div className="text-center py-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold">Withdrawal Request Submitted</h2>
            <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
              Your withdrawal of ${num.toFixed(2)} is now in process. It will be processed within 2 to 12 hours via {lastMethod}.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NetworkErrorBanner />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdraw</h1>
        <p className="text-sm text-muted">Withdraw your funds</p>
      </div>

      {!isVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p className="text-amber-800">Please verify your email before making a withdrawal.</p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted">Available Balance</p>
            <p className="text-2xl font-bold mt-1">{formatBalance(balance, isPK)}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-muted">Withdrawal Method</p>
            <p className="text-base font-semibold mt-1 capitalize">{lastMethod || "No deposit history"}</p>
            {lastMethod && (
              <p className="text-xs text-muted mt-0.5">
                Funds will be sent to your {lastMethod} account
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Amount ({isPK ? "PKR" : "USD"})</label>
            <div className="mt-1.5 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">{isPK ? "Rs." : "$"}</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-xl border border-border bg-transparent pl-10 pr-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                placeholder="0.00" min={0} max={balance} step="0.01" />
            </div>
            {num > balance && <p className="mt-1.5 text-xs text-red-400">Exceeds available balance</p>}
          </div>

          {isCrypto && (
            <div>
              <label className="block text-sm font-medium">Crypto Withdrawal Address</label>
              <textarea
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                rows={3}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted resize-none"
                placeholder="Enter your wallet address (e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa)"
                required
              />
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-800">
              Withdrawals process in 2-12 hours. You can only withdraw using the same method used during your last deposit ({lastMethod || "none"}).
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button type="submit" disabled={!valid || submitting || !isVerified || !isOnline}
            className="cursor-pointer w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40 transition-colors">
            {submitting ? "Processing..." : !isOnline ? "No internet connection" : `Withdraw ${isPK ? "Rs." : "$"}${num || "0.00"}`}
          </button>
        </form>
      </Card>
    </div>
  );
}
