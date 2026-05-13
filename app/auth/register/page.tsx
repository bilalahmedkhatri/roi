"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
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
              <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                placeholder="John Doe" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted"
                placeholder="Create a strong password" required />
            </div>
            <button type="submit"
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
              Create account
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-muted/60">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-primary transition-colors">Terms of Service</Link> and{' '}
          <Link href="/privacy" className="underline hover:text-primary transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
