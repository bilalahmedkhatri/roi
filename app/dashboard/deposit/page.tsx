"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";
import { detectPakistan } from "@/lib/country";

type Method = "easypaisa" | "jazzcash" | "crypto";

export default function DepositPage() {
  const isPK = detectPakistan();
  const [isVerified, setIsVerified] = useState(true);
  const [method, setMethod] = useState<Method>("easypaisa");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<{
    crypto_addresses: Record<string, string>;
    till_ids: Record<string, string>;
    bonus_percent: number;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.email_confirmed_at) setIsVerified(false);
    });
    supabase.rpc("get_site_settings").single().then(({ data }) => {
      if (data) setSettings(data as any);
    });
  }, []);

  const num = parseFloat(amount) || 0;
  const isCrypto = method === "crypto";
  const min = isCrypto ? 25 : 5;
  const valid = num >= min && transactionId.trim() && senderName.trim() && senderNumber.trim();

  const pkMethods: Method[] = ["easypaisa", "jazzcash", "crypto"];
  const intlMethods: Method[] = ["crypto"];
  const availableMethods = isPK ? pkMethods : intlMethods;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !settings) return;
    setError("");
    setSubmitting(true);

    const { error: rpcError } = await supabase.rpc("submit_deposit", {
      p_amount: num,
      p_method: method === "easypaisa" ? "Easypaisa" : method === "jazzcash" ? "JazzCash" : "Crypto",
      p_transaction_id: transactionId.trim(),
      p_sender_name: senderName.trim(),
      p_sender_number: senderNumber.trim(),
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deposit</h1>
          <p className="text-sm text-muted">Add funds to your account</p>
        </div>
        <Card>
          <div className="text-center py-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold">Deposit Request Submitted</h2>
            <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
              Your deposit of {isCrypto ? `$${num.toFixed(2)}` : `Rs. ${num.toFixed(2)}`} via {method} is now in process.
              It will be confirmed within 5 to 10 minutes. If not approved, contact support with your deposit slip screenshot.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const methodLabel = (m: Method) =>
    m === "crypto"
      ? `Crypto (Min $25 USD - +10% bonus)`
      : `${m.charAt(0).toUpperCase() + m.slice(1)} (Min Rs. 1,500)`;

  const tillId = method !== "crypto" ? settings?.till_ids?.[method] : null;
  const cryptoAddresses = settings?.crypto_addresses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deposit</h1>
        <p className="text-sm text-muted">Add funds to your account</p>
      </div>

      {!isVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p className="text-amber-800">Please verify your email before making a deposit.</p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as Method)}
              className="block w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            >
              {availableMethods.map((m) => (
                <option key={m} value={m}>{methodLabel(m)}</option>
              ))}
            </select>
          </div>

          {isPK && !isCrypto && tillId && (
            <div className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
              <p className="text-xs font-medium text-muted">Send money to this Till ID</p>
              <p className="text-2xl font-bold tracking-wider text-primary">{tillId}</p>
              <p className="text-sm text-muted">Account: ROI AI Trading ({method === "easypaisa" ? "Easypaisa" : "JazzCash"})</p>
            </div>
          )}

          {(isCrypto || !isPK) && cryptoAddresses && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <p className="text-xs font-medium text-muted">Send crypto to one of these addresses:</p>
              {Object.entries(cryptoAddresses).map(([coin, addr]) => (
                <div key={coin} className="text-sm">
                  <span className="font-medium uppercase text-primary">{coin}:</span>{" "}
                  <span className="text-muted break-all">{addr}</span>
                </div>
              ))}
              <p className="text-xs text-muted">Min $25 — receives +10% bonus</p>
            </div>
          )}

          {!isPK && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-xs text-blue-400 leading-relaxed">
                Current rates: 1 BTC ≈ $67,542 | 1 ETH ≈ $3,457 | 1 SOL ≈ $142.56
              </p>
            </div>
          )}

          {isPK && !isCrypto && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <ol className="text-xs text-amber-800 space-y-1.5 list-decimal list-inside">
                <li>Take the Till ID above.</li>
                <li>Go to {method === "easypaisa" ? "Easypaisa" : "JazzCash"} and send money to that Till ID.</li>
                <li>Come back and enter the transaction details below.</li>
                <li>Click Submit — approved in 5 to 10 minutes.</li>
                <li>If not approved, contact support with the deposit slip screenshot.</li>
              </ol>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Amount ({isCrypto ? "USD" : "PKR"})</label>
            <div className="mt-1.5 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">{isCrypto ? "$" : "Rs."}</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-xl border border-border bg-transparent pl-10 pr-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                placeholder="0.00" min={min} step="0.01" />
            </div>
            {!valid && amount && (
              <p className="mt-1.5 text-xs text-red-400">
                {isCrypto ? `Minimum deposit is $${min} for crypto` : "Minimum deposit is Rs. 1,500"}
              </p>
            )}
            {method === "crypto" && num >= 25 && (
              <p className="mt-1.5 text-xs text-primary">+10% crypto bonus: ${(num * 0.1).toFixed(2)} extra</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Transaction ID</label>
            <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
              placeholder="Enter transaction / payment ID" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Sender Name</label>
              <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                placeholder="Full name" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Sender Number</label>
              <input type="tel" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                placeholder="03XX-XXXXXXX" required />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button type="submit" disabled={!valid || submitting || !isVerified}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40 transition-colors">
            {submitting ? "Submitting..." : "Submit Deposit Request"}
          </button>
        </form>
      </Card>
    </div>
  );
}
