"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
            <span className="text-xs font-bold text-white">R</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            ROI <span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/#plans" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
            Plans
          </Link>
          <Link href="/#strategy" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
            Strategy
          </Link>
          <Link href="/support" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
            Support
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-surface transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-1">
          <Link href="/" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors">
            Home
          </Link>
          <Link href="/#plans" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors">
            Plans
          </Link>
          <Link href="/#strategy" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors">
            Strategy
          </Link>
          <Link href="/support" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors">
            Support
          </Link>
          <div className="pt-3 flex gap-3">
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-surface transition-colors">
              Login
            </Link>
            <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
