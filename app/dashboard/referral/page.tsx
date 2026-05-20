"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";
import { detectPakistan, formatAmount } from "@/lib/country";

const BASE_URL = "https://roiaitrading.com";

export default function ReferralPage() {
  const isPK = detectPakistan();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<{
    totalReferred: number;
    activeReferred: number;
    totalDeposits: number;
    commissionEarned: number;
  } | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.rpc("get_referral_stats").single(),
      supabase.rpc("get_referral_list"),
    ]).then(([statsRes, listRes]) => {
      const stats = statsRes.data as any;
      if (stats) {
        setReferralCode(stats.referral_code || "");
        setStats({
          totalReferred: Number(stats.total_referred),
          activeReferred: Number(stats.active_referred),
          totalDeposits: Number(stats.total_deposits),
          commissionEarned: Number(stats.commission_earned),
        });
      }
      if (listRes.data) setReferrals(listRes.data as any);
      setLoading(false);
    });
  }, []);

  const referralLink = `${BASE_URL}/auth/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <h1 className="text-2xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-sm text-muted">Invite friends and earn together</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs text-muted">Total Referrals</p>
          <p className="text-2xl font-bold mt-1">{stats?.totalReferred || 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Active Users</p>
          <p className="text-2xl font-bold mt-1">{stats?.activeReferred || 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Deposits from Referrals</p>
          <p className="text-2xl font-bold mt-1">{stats ? formatAmount(stats.totalDeposits, isPK) : "$0"}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Commission Earned</p>
          <p className="text-2xl font-bold mt-1">{stats ? formatAmount(stats.commissionEarned, isPK) : "$0"}</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-sm">Your Referral Link</h2>
        <p className="text-xs text-muted mt-1">Share this link with friends to invite them</p>
        <div className="mt-3 flex gap-2">
          <input readOnly value={referralLink}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted select-all"
          />
          <button onClick={handleCopy}
            className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-sm">Referred Users</h2>
        <p className="text-xs text-muted">People who joined using your link</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Name</th>
                <th className="pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Joined</th>
                <th className="pb-3 text-right font-medium text-muted text-xs uppercase tracking-wider">Deposit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {referrals.map((r: any) => (
                <tr key={r.id}>
                  <td className="py-3 text-sm font-medium">{r.referred_name || "—"}</td>
                  <td className="py-3 text-sm text-muted hidden sm:table-cell">{r.referred_email}</td>
                  <td className="py-3 text-sm text-muted">{r.joined || "—"}</td>
                  <td className={`py-3 text-sm font-medium text-right ${Number(r.deposit_amount) > 0 ? "text-primary" : "text-muted"}`}>
                    {Number(r.deposit_amount) > 0 ? formatAmount(Number(r.deposit_amount), isPK) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {referrals.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">No referrals yet. Share your link to get started!</p>
          )}
        </div>
      </Card>
    </div>
  );
}
