"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { detectPakistan, formatBalance } from "@/lib/country";

const LAST_DEPOSIT_METHOD: string = "easypaisa";
const LAST_DEPOSIT_TILL = "03001234567";

export default function WithdrawPage() {
  const isPK = detectPakistan();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const num = parseFloat(amount) || 0;
  const max = 15750.42;
  const valid = num > 0 && num <= max;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
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
              Your withdrawal of {isPK ? `Rs. ${num.toFixed(2)}` : `$${num.toFixed(2)}`} is now in process.
              It will be processed within 2 to 12 hours via {LAST_DEPOSIT_METHOD}.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdraw</h1>
        <p className="text-sm text-muted">Withdraw your funds</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted">Available Balance</p>
            <p className="text-2xl font-bold mt-1">{formatBalance(max, isPK)}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-muted">Withdrawal Method</p>
            <p className="text-base font-semibold mt-1 capitalize">{LAST_DEPOSIT_METHOD}</p>
            <p className="text-xs text-muted mt-0.5">
              {LAST_DEPOSIT_METHOD === "crypto"
                ? "Funds will be sent to your saved crypto address"
                : `Funds will be sent to your ${LAST_DEPOSIT_METHOD} account`}
            </p>
            {LAST_DEPOSIT_METHOD !== "crypto" && (
              <p className="text-xs text-muted mt-1">Till ID: {LAST_DEPOSIT_TILL}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Amount ({isPK ? "PKR" : "USD"})</label>
            <div className="mt-1.5 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                {isPK ? "Rs." : "$"}
              </span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-xl border border-border bg-transparent pl-10 pr-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                placeholder="0.00" min={0} max={max} step="0.01" />
            </div>
            {num > max && <p className="mt-1.5 text-xs text-red-400">Exceeds available balance</p>}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-800">
              Withdrawals process in 2-12 hours. You can only withdraw using the same method used during your last deposit ({LAST_DEPOSIT_METHOD}).
            </p>
          </div>

          <button type="submit" disabled={!valid || submitting}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40 transition-colors">
            {submitting ? "Processing..." : `Withdraw ${isPK ? "Rs." : "$"}${num || "0.00"}`}
          </button>
        </form>
      </Card>
    </div>
  );
}
