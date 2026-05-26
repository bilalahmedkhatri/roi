import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark">
                <span className="text-[10px] font-bold text-white">R</span>
              </div>
              <span className="text-base font-bold tracking-tight">
                ROI <span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              AI-powered automated trading platform engineered for intelligent algorithmic returns.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">Platform</h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/#plans" className="text-sm text-muted hover:text-foreground transition-colors">Investment Plans</Link></li>
              <li><Link href="/#strategy" className="text-sm text-muted hover:text-foreground transition-colors">Strategy</Link></li>
              <li><Link href="/support" className="text-sm text-muted hover:text-foreground transition-colors">Support</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">Legal</h3>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-muted hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="text-sm text-muted hover:text-foreground transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} ROI AI Trading. All rights reserved.
            </p>
            <p className="text-xs text-muted/60 text-center sm:text-right">
              Trading involves risk. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
