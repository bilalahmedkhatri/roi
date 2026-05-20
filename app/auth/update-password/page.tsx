"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const RATE_LIMIT_WINDOW = 2000;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      setChecking(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const now = Date.now();
    if (now - lastAttempt < RATE_LIMIT_WINDOW) {
      setError("Please wait before trying again");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!PASSWORD_RULES.test(password)) {
      setError("Password must be 8+ chars with uppercase, lowercase, number, and special character.");
      return;
    }

    setLoading(true);
    setLastAttempt(now);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setDone(true);
  };

  if (checking) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <p className="text-sm text-muted">Checking session...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Password updated</h1>
            <p className="mt-1.5 text-sm text-muted">Your password has been changed successfully.</p>
          </div>
          <Link
            href="/auth/login"
            className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Sign in with new password
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
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Set new password</h1>
          <p className="mt-1.5 text-sm text-muted">Enter your new password below</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface-elevated p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                placeholder="New password"
                required
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-muted">8+ chars, uppercase, lowercase, number, special char</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                placeholder="Confirm new password"
                required
                autoComplete="new-password"
              />
            </div>

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
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
