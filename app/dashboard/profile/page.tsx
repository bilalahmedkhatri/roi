"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email || "");
      const { data: profile } = await supabase
        .from("users")
        .select("name, phone, address, city, withdraw_address")
        .eq("auth_id", user.id)
        .single();
      if (profile) {
        setName(profile.name || "");
        setPhone(profile.phone || "");
        setAddress(profile.address || "");
        setCity(profile.city || "");
        setWithdrawAddress(profile.withdraw_address || "");
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("users")
      .update({ name, phone, address, city, withdraw_address: withdrawAddress, updated_at: new Date().toISOString() })
      .eq("auth_id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted">Manage your personal details</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
              placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" value={email} disabled
              className="mt-1.5 block w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted cursor-not-allowed" />
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

          {saved && (
            <p className="text-xs text-primary font-medium">Profile updated successfully.</p>
          )}

          <button type="submit" disabled={saving}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40 transition-colors">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Card>
    </div>
  );
}
