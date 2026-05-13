"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { detectPakistan } from "@/lib/country";

type Method = "easypaisa" | "jazzcash" | "crypto";

const CRYPTO_ADDRESSES = {
  btc: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  eth: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
  sol: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuF9UNNQm9JQ7N",
};

const TILL_IDS = {
  easypaisa: "03001234567",
  jazzcash: "03007654321",
};

export default function DepositPage() {
  const isPK = detectPakistan();
  const [method, setMethod] = useState<Method>("easypaisa");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const num = parseFloat(amount) || 0;
  const isCrypto = method === "crypto";
  const min = isCrypto ? 25 : 5;
  const valid = num >= min && transactionId.trim() && senderName.trim() && senderNumber.trim();

  const pkMethods: Method[] = ["easypaisa", "jazzcash", "crypto"];
  const intlMethods: Method[] = ["crypto"];

  const availableMethods = isPK ? pkMethods : intlMethods;

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deposit</h1>
        <p className="text-sm text-muted">Add funds to your account</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select value={method} onChange={(e) => { setMethod(e.target.value as Method); setSubmitted(false); }}
              className="block w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
            >
              {availableMethods.map((m) => (
                <option key={m} value={m} className="capitalize">
                  {m === "crypto" ? `Crypto (Min $25 USD - +10% bonus)` : `${m.charAt(0).toUpperCase() + m.slice(1)} (Min Rs. 1,500)`}
                </option>
              ))}
            </select>
          </div>

          {isPK && !isCrypto && (
            <div className="rounded-xl border border-border bg-surface p-5 text-center space-y-2">
              <p className="text-xs font-medium text-muted">Send money to this Till ID</p>
              <p className="text-2xl font-bold tracking-wider text-primary">{TILL_IDS[method as "easypaisa" | "jazzcash"]}</p>
              <p className="text-sm text-muted">Account: ROI AI Trading ({method === "easypaisa" ? "Easypaisa" : "JazzCash"})</p>
            </div>
          )}

          {isPK && isCrypto && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <p className="text-xs font-medium text-muted">Send crypto to one of these addresses:</p>
              {Object.entries(CRYPTO_ADDRESSES).map(([coin, addr]) => (
                <div key={coin} className="text-sm">
                  <span className="font-medium uppercase text-primary">{coin}:</span>{" "}
                  <span className="text-muted break-all">{addr}</span>
                </div>
              ))}
              <p className="text-xs text-muted">Min $25 - receives +10% bonus</p>
            </div>
          )}

          {!isPK && method === "crypto" && (
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <p className="text-xs font-medium text-muted">Send crypto to one of these addresses:</p>
              {Object.entries(CRYPTO_ADDRESSES).map(([coin, addr]) => (
                <div key={coin} className="text-sm">
                  <span className="font-medium uppercase text-primary">{coin}:</span>{" "}
                  <span className="text-muted break-all">{addr}</span>
                </div>
              ))}
              <p className="text-xs text-muted">Min $25 - receives +10% bonus</p>
            </div>
          )}

          {!isPK && method === "crypto" && (
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
                <li>Come back to this website and enter the transaction details below.</li>
                <li>Click Submit - your request will be approved in 5 to 10 minutes.</li>
                <li>If your deposit is not approved, contact support with the deposit slip screenshot.</li>
              </ol>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">
              Amount ({isCrypto ? "USD" : "PKR"})
            </label>
            <div className="mt-1.5 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                {isCrypto ? "$" : "Rs."}
              </span>
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

          <button type="submit" disabled={!valid || submitting}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40 transition-colors">
            {submitting ? "Submitting..." : "Submit Deposit Request"}
          </button>
        </form>
      </Card>

      <div className="rounded-xl border border-border bg-surface-elevated p-5">
        <h3 className="text-sm font-semibold">How to Deposit</h3>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          {isPK && !isCrypto ? (
            <>
              <li>1. Take the Till ID shown above.</li>
              <li>2. Go to {method === "easypaisa" ? "Easypaisa" : "JazzCash"} and send money to that Till ID.</li>
              <li>3. Come back to this website and enter the Transaction ID, your name, and number.</li>
              <li>4. Click Submit - your request will be approved in 5 to 10 minutes.</li>
              <li>5. If your deposit is not approved, contact support with the deposit slip screenshot.</li>
            </>
          ) : (
            <>
              <li>1. Send crypto to one of the addresses above (BTC, ETH, or SOL).</li>
              <li>2. Minimum $25 - you receive a 10% bonus on crypto deposits.</li>
              <li>3. Enter the transaction ID from your wallet.</li>
              <li>4. Your deposit will be confirmed within 5 to 10 minutes.</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
