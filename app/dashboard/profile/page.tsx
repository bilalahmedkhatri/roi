"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted">Manage your personal details</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-full">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
              placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
              placeholder="+1 234 567 8900" />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
              placeholder="123 Main St" />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
              placeholder="New York" />
          </div>
          <div>
            <label className="block text-sm font-medium">Withdraw Address</label>
            <input type="text" value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
              placeholder="BTC / ETH / USDT wallet address" />
            <p className="mt-1 text-xs text-muted">Your crypto wallet address for withdrawals</p>
          </div>
          <button type="submit" className="rounded-xl bg-primary w-full py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
            Save Changes
          </button>
        </form>
      </Card>
    </div>
  );
}
