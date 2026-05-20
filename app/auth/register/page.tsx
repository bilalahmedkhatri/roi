"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { detectPakistan } from "@/lib/country";

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const RATE_LIMIT_WINDOW = 2000;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
    setCountry(detectPakistan() ? "Pakistan" : "");

    fetch("https://ipwho.is/")
      .then((r) => r.json())
      .then((d) => {
        if (d.city) setCity(d.city);
        if (d.country && !detectPakistan()) setCountry(d.country);
      })
      .catch(() => {});
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const now = Date.now();
    if (now - lastAttempt < RATE_LIMIT_WINDOW) {
      setError("Please wait before trying again");
      return;
    }

    if (!PASSWORD_RULES.test(password)) {
      setError("Password must be 8+ chars with uppercase, lowercase, number, and special character.");
      return;
    }

    setLoading(true);
    setLastAttempt(now);

    const metadata = {
      name,
      phone,
      ref: referralCode.trim() || null,
      city,
      country,
      timezone,
      role: "client",
    };

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setError("An account with this email already exists");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (data.user) {
      router.push("/dashboard?verify=true");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <span className="text-xs font-bold text-white">R</span>
            </div>
          </Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted">Start your AI trading journey</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface-elevated p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Strong password"
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30" />
              <p className="mt-1 text-xs text-muted">8+ chars, uppercase, lowercase, number, special char</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Referral Code</label>
              <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)}
                placeholder="ABC123"
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30" />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
