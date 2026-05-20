"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const RATE_LIMIT_WINDOW = 2000;

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [found, setFound] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFound(false);

    const now = Date.now();
    if (now - lastAttempt < RATE_LIMIT_WINDOW) {
      setError("Please wait before trying again");
      return;
    }

    setLoading(true);
    setLastAttempt(now);

    const { data: exists, error: checkError } = await supabase.rpc("check_email_exists", {
      p_email: email,
    });

    if (checkError) {
      setLoading(false);
      setError(checkError.message);
      return;
    }

    if (!exists) {
      setLoading(false);
      setError("No account found with this email address");
      return;
    }

    setFound(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password` }
    );

    setLoading(false);

    if (resetError) {
      setFound(false);
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
                <span className="text-xs font-bold text-white">R</span>
              </div>
            </Link>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Email found ✓</h1>
            <p className="mt-1.5 text-sm text-muted">
              We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <span className="text-xs font-bold text-white">R</span>
            </div>
          </Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Reset your password</h1>
          <p className="mt-1.5 text-sm text-muted">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface-elevated p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {found && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="text-xs text-emerald-400">✓ Email found. Sending reset link...</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40 transition-colors"
            >
              {loading && !found ? "Checking..." : loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Remember your password?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
