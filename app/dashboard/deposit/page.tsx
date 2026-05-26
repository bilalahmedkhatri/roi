"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";
import { detectPakistan, CRYPTO_RATES, USD_TO_PKR } from "@/lib/country";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import NetworkErrorBanner from "@/components/ui/NetworkErrorBanner";

type Method = "easypaisa" | "jazzcash" | "crypto";

const CRYPTO_LOGOS: Record<string, string> = {
  BTC: "₿",
  ETH: "⟠",
  USDT: "₮",
  SOL: "◎",
  BNB: "⬤",
  XRP: "✕",
  ADA: "₳",
  DOT: "●",
};

const FIAT_DECIMALS = 2;
const CRYPTO_DECIMALS = 8;

export default function DepositPage() {
  const isPK = detectPakistan();
  const isOnline = useOnlineStatus();
  const [isVerified, setIsVerified] = useState(true);
  const [method, setMethod] = useState<Method>("easypaisa");
  const [cryptoCurrency, setCryptoCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [cryptoQty, setCryptoQty] = useState("");
  const [fiatQty, setFiatQty] = useState("");
  const [lastChanged, setLastChanged] = useState<"crypto" | "fiat" | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [copyTip, setCopyTip] = useState<{ x: number; y: number } | null>(null);
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

  const isCrypto = method === "crypto";
  const cryptoCurrencies = settings?.crypto_addresses ? Object.keys(settings.crypto_addresses) : [];
  const num = parseFloat(amount) || 0;
  const min = isCrypto ? 0 : 1500;

  const fiatNum = parseFloat(fiatQty) || 0;
  const bonus = isCrypto ? fiatNum * 0.1 : 0;
  const fiatSymbol = isPK ? "Rs." : "$";

  const cryptoRate = cryptoCurrency ? CRYPTO_RATES[cryptoCurrency.toUpperCase()] || 0 : 0;
  const fiatMultiplier = isPK ? cryptoRate * USD_TO_PKR : cryptoRate;

  const valid = isCrypto
    ? fiatNum > 0 && !!cryptoCurrency && transactionId.trim().length > 0 && senderName.trim().length > 0 && senderNumber.trim().length > 0
    : num >= min && transactionId.trim().length > 0 && senderName.trim().length > 0 && senderNumber.trim().length > 0;

  const pkMethods: Method[] = ["easypaisa", "jazzcash", "crypto"];
  const intlMethods: Method[] = ["crypto"];
  const availableMethods = isPK ? pkMethods : intlMethods;

  const handleCryptoQtyChange = useCallback((val: string) => {
    setCryptoQty(val);
    setLastChanged("crypto");
    if (val === "") {
      setFiatQty("");
      return;
    }
    const qty = parseFloat(val) || 0;
    if (qty > 0 && fiatMultiplier > 0) {
      setFiatQty((qty * fiatMultiplier).toFixed(FIAT_DECIMALS));
    } else {
      setFiatQty("");
    }
  }, [fiatMultiplier]);

  const handleFiatQtyChange = useCallback((val: string) => {
    setFiatQty(val);
    setLastChanged("fiat");
    if (val === "") {
      setCryptoQty("");
      return;
    }
    const fv = parseFloat(val) || 0;
    if (fv > 0 && fiatMultiplier > 0) {
      setCryptoQty((fv / fiatMultiplier).toFixed(CRYPTO_DECIMALS));
    } else {
      setCryptoQty("");
    }
  }, [fiatMultiplier]);

  const handleMethodChange = (m: Method) => {
    setMethod(m);
    setCryptoCurrency("");
    setCryptoQty("");
    setFiatQty("");
    setAmount("");
    setLastChanged(null);
  };

  const handleCryptoCurrencyChange = (cc: string) => {
    setCryptoCurrency(cc);
    setCryptoQty("");
    setFiatQty("");
    setLastChanged(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !settings) return;
    setError("");
    setSubmitting(true);

    const p_amount = isCrypto ? Math.round(fiatNum) : Math.round(num);

    const { error: rpcError } = await supabase.rpc("submit_deposit", {
      p_amount,
      p_method: method === "easypaisa" ? "Easypaisa" : method === "jazzcash" ? "JazzCash" : "Crypto",
      p_transaction_id: transactionId.trim(),
      p_sender_name: senderName.trim(),
      p_sender_number: senderNumber.trim(),
      p_crypto_currency: isCrypto ? cryptoCurrency : null,
      p_raw_crypto: isCrypto ? parseFloat(cryptoQty) : null,
      p_currency_used: isCrypto ? (isPK ? "PKR" : "USD") : null,
    });

    setSubmitting(false);

    if (rpcError) {
      if (rpcError.message?.includes("deposits_tx_unique")) {
        setError("This transaction ID has already been used. Please check your ID or contact support.");
      } else {
        setError(rpcError.message);
      }
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <NetworkErrorBanner />
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
              Your deposit of {isCrypto ? `${fiatSymbol} ${fiatNum.toFixed(FIAT_DECIMALS)}` : `Rs. ${num.toFixed(FIAT_DECIMALS)}`} via {method}{isCrypto && cryptoCurrency ? ` (${cryptoCurrency})` : ""} is now in process.
              It will be confirmed within 5 to 10 minutes. If not approved, contact support with your deposit slip screenshot.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const methodLabel = (m: Method) =>
    m === "crypto"
      ? `Crypto (+10% bonus) ${isPK ? "(Min Rs. 7,000 eq.)" : "(Min $25 eq.)"}`
      : `${m.charAt(0).toUpperCase() + m.slice(1)} (Min Rs. 1,500)`;

  const tillId = method !== "crypto" ? settings?.till_ids?.[method] : null;
  const selectedAddress = isCrypto && cryptoCurrency ? settings?.crypto_addresses?.[cryptoCurrency] : null;

  return (
    <div className="space-y-6">
      <NetworkErrorBanner />

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
            <select value={method} onChange={(e) => handleMethodChange(e.target.value as Method)}
              className="block w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            >
              {availableMethods.map((m) => (
                <option key={m} value={m}>{methodLabel(m)}</option>
              ))}
            </select>
          </div>

          {isCrypto && cryptoCurrencies.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Crypto Currency</label>
              <select value={cryptoCurrency} onChange={(e) => handleCryptoCurrencyChange(e.target.value)}
                className="uppercase block w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              >
                <option value="">Select currency</option>
                {cryptoCurrencies.map((cc) => (
                  <option key={cc} className="uppercase" value={cc}>{cc}</option>
                ))}
              </select>
            </div>
          )}

          {isPK && !isCrypto && tillId && (
            <div className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
              <p className="text-xs font-medium text-muted">Send money to this Till ID</p>
              <p className="text-2xl font-bold tracking-wider text-primary">{tillId}</p>
              <p className="text-sm text-muted">Account: ROI AI Trading ({method === "easypaisa" ? "Easypaisa" : "JazzCash"})</p>
            </div>
          )}

          {isCrypto && selectedAddress && (
            <div className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
              <p className="text-xs md:text-lg font-medium text-muted">Send <span className="uppercase">{cryptoCurrency}</span> to this address</p>
              <p
                className="text-sm md:text-lg font-mono tracking-tight text-primary break-all bg-background/50 rounded-lg p-3 border border-border/50 cursor-pointer select-all hover:bg-background/80 transition-colors"
                onClick={(e) => {
                  navigator.clipboard.writeText(selectedAddress);
                  setCopyTip({ x: e.clientX, y: e.clientY });
                  setTimeout(() => setCopyTip(null), 1200);
                }}
              >
                {selectedAddress}
              </p>
              {copyTip && (
                <span
                  className="fixed pointer-events-none text-xs bg-foreground text-background px-2 py-1 rounded-md shadow-lg z-50"
                  style={{ left: copyTip.x - 24, top: copyTip.y - 32 }}
                >
                  Copied!
                </span>
              )}
            </div>
          )}

          {isCrypto && cryptoCurrency && !selectedAddress && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">No address configured for <span className="uppercase">{cryptoCurrency}</span>. Contact support.</p>
            </div>
          )}

          {isCrypto && cryptoCurrency && cryptoRate > 0 && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-center">
              <p className="uppercase text:sm md:text-lg  text-blue-400">
                1 {cryptoCurrency} = {isPK ? `Rs. ${(cryptoRate * USD_TO_PKR).toLocaleString()}` : `$${cryptoRate.toLocaleString()}`}
                {isPK ? ` ($${cryptoRate.toLocaleString()})` : ""}
              </p>
            </div>
          )}

          {!isPK && !isCrypto && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-md text-blue-400 leading-relaxed">
                Current rates: 1 BTC ≈ ${CRYPTO_RATES.BTC.toLocaleString()} | 1 ETH ≈ ${CRYPTO_RATES.ETH.toLocaleString()} | 1 SOL ≈ ${CRYPTO_RATES.SOL.toLocaleString()}
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

          {isCrypto && cryptoCurrency && cryptoRate > 0 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Crypto Amount ({cryptoCurrency})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">
                    {CRYPTO_LOGOS[cryptoCurrency] || "⟐"}
                  </span>
                  <input type="number" value={cryptoQty} onChange={(e) => handleCryptoQtyChange(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-transparent pl-10 pr-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                    placeholder="0.00000000" step="0.00000001" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount ({isPK ? "PKR eq." : "USD eq."})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">{fiatSymbol}</span>
                  <input type="number" value={fiatQty} onChange={(e) => handleFiatQtyChange(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-transparent pl-10 pr-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                    placeholder="0.00" step="0.01" />
                </div>
              </div>
              {bonus > 0 && (
                <p className="text-xs text-primary">+10% crypto bonus: {fiatSymbol} {bonus.toFixed(FIAT_DECIMALS)} extra</p>
              )}
            </div>
          ) : isCrypto && cryptoCurrency && cryptoRate === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">Exchange rate not available for <span className="uppercase">{cryptoCurrency}</span>. Contact support.</p>
            </div>
          ) : !isCrypto ? (
            <div>
              <label className="block text-sm font-medium">Amount (PKR)</label>
              <div className="mt-1.5 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">Rs.</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-xl border border-border bg-transparent pl-10 pr-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
                  placeholder="0.00" step="0.01" />
              </div>
              {!valid && amount && num < min && (
                <p className="mt-1.5 text-xs text-red-400">Minimum deposit is Rs. 1,500</p>
              )}
            </div>
          ) : null}

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
              <p className="text-xs md:text-sm text-red-400">{error}</p>
            </div>
          )}

          <button type="submit" disabled={!valid || submitting || !isVerified || !isOnline}
            className="cursor-pointer w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40 transition-colors">
            {submitting ? "Submitting..." : !isOnline ? "No internet connection" : "Submit Deposit Request"}
          </button>
        </form>
      </Card>
    </div>
  );
}
