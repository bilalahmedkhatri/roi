import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TradingDashboard from "@/components/landing/TradingDashboard";
import AITradingBrain from "@/components/trading/AITradingBrain";

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* ─── Hero ─── */}
      <section className="relative px-4 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40">
        <div className="hero-glow top-[-200px] left-1/2 -translate-x-1/2" />
        <div className="hero-glow bottom-[-300px] right-[-200px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
              <span className="text-xs font-medium text-primary">AI Trading Engine Live</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Let AI Trade for You.{' '}
              <span className="gradient-text">Earn Daily.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted leading-relaxed max-w-xl mx-auto">
              ROI AI Trading combines machine learning with real-time market data to automate your investments.
              No experience needed - just deposit and watch your portfolio grow.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button href="/auth/register" size="lg" className="w-full sm:w-auto">Start Earning</Button>
              <Button href="#plans" variant="outline" size="lg" className="w-full sm:w-auto">View Plans</Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                No hidden fees
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Instant deposits
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Secure withdrawals
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </section>

      <TradingDashboard />

      {/* ─── Stats ─── */}
      <section className="border-y border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "$1.2M+", label: "Total Payouts" },
              { value: "6,000+", label: "Active Users" },
              { value: "20K+", label: "Daily Trades" },
              { value: "28%", label: "Avg. Return" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Plans ─── */}
      <section id="plans" className="px-2 md:px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Investment Plans</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Choose Your Strategy</h2>
            <p className="mt-4 text-muted leading-relaxed">
              Every plan adapts to live market conditions. Rates are targets, not guarantees.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Weekly Plan", range: "5–10%", duration: "7 Days", min: "$5", features: ["Short-term growth", "Quick liquidity", "Low entry barrier"], popular: false },
              { name: "15 Days Plan", range: "15–30%", duration: "15 Days", min: "$5", features: ["Balanced risk", "Mid-term strategy", "Higher potential"], popular: true },
              { name: "Monthly Plan", range: "20–50%", duration: "30 Days", min: "$5", features: ["Maximum returns", "Long-term compounding", "Premium analytics"], popular: false },
            ].map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border p-4 md:p-8 card-hover ${plan.popular ? "border-primary/40 bg-primary/[0.03] glow-green" : "border-border bg-surface-elevated"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[11px] font-semibold text-white tracking-wide">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted">{plan.duration} duration</p>
                <p className="mt-5">
                  <span className="text-4xl font-bold text-primary">{plan.range}</span>
                  <span className="text-sm text-muted ml-1">return</span>
                </p>
                <p className="mt-1 text-xs text-muted">Min deposit {plan.min}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-[11px] text-muted">* Rates depend on market conditions.</div>
                <Button href="/auth/register" variant={plan.popular ? "primary" : "outline"} className="mt-5 w-full">Get Started</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-y border-border bg-surface/30 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Simple Process</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-4 text-muted leading-relaxed">Three steps to start earning with AI-powered trading.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Create Account", desc: "Sign up in seconds. No complex verification or delays." },
              { step: "02", title: "Deposit Funds", desc: "Add funds via Easypaisa, JazzCash, or Crypto. From $5." },
              { step: "03", title: "Earn Daily", desc: "AI trades automatically. Watch your balance grow in real time." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
                  <span className="text-lg font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Strategy ─── */}
      <section id="strategy" className="px-4 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 grid-cols-1 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Our Edge</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">AI Trading Strategy</h2>
              <p className="mt-4 text-muted leading-relaxed">
                We deploy proprietary machine learning models that analyze market microstructure and execute trades with precision.
              </p>
              <div className="mt-12 space-y-5">
                {[
                  { title: "Machine Learning Models", desc: "Our algorithms process terabytes of historical and real-time data to identify profitable patterns." },
                  { title: "Risk Management", desc: "Multi-layer risk controls protect capital through position sizing, stop-losses, and diversification." },
                  { title: "24/7 Execution", desc: "The system never sleeps - capturing opportunities across global markets around the clock." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-sm text-muted mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:py-10">
        <div className="bg-surface-elevated mx-auto max-w-7xl px-4 py-8 md:py-10 rounded-[12px]">
          <AITradingBrain />
        </div>
      </section>

      <section className="px-4 py-10 md:py-15">
        <div className="mx-auto max-w-7xl mt-5">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Why Us</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Built for Performance</h2>
            <p className="mt-4 text-muted leading-relaxed">Every feature is engineered to give you an edge in the markets.</p>
          </div>
          <div className="mt-15 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "AI-Powered", desc: "Advanced ML models drive every trading decision in real time." },
              { title: "Live Dashboard", desc: "Track earnings, portfolio performance, and market data instantly." },
              { title: "Bank-Grade Security", desc: "Encrypted infrastructure with continuous threat monitoring." },
              { title: "Flexible Payments", desc: "Deposit via Easypaisa, JazzCash, or Crypto with bonus rewards." },
              { title: "24/7 Support", desc: "Real humans ready to help you any time of day or night." },
              { title: "Full Transparency", desc: "Every trade, every earning - completely visible in your dashboard." },
            ].map((f) => (
              <Card key={f.title} hover>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="px-4 py-10 sm:py-15">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Testimonials</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Trusted by Investors</h2>
            <p className="mt-4 text-muted leading-relaxed">Join thousands earning with AI-powered trading.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Ahmed K.", role: "Investor", text: "I was skeptical, but the AI results speak for themselves. My portfolio has grown consistently every month since I started." },
              { name: "Sarah M.", role: "Crypto Trader", text: "The live dashboard gives me total visibility. I can see exactly how my money is working in real time." },
              { name: "John D.", role: "New Investor", text: "Started small to test it. The returns exceeded expectations. Now I'm on the monthly plan." },
            ].map((t) => (
              <Card key={t.name}>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="border-y border-border bg-surface/30 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">Common Questions</h2>
          </div>
          <div className="mt-10 space-y-2">
            {[
              { q: "How does AI trading work?", a: "Our algorithms analyze thousands of data points per second to identify and execute profitable trades automatically." },
              { q: "What's the minimum deposit?", a: "$5 USD or 1,500 PKR via Easypaisa/JazzCash. Crypto deposits start at $25 with a 10% bonus." },
              { q: "How are returns calculated?", a: "Returns depend on plan and market conditions: Weekly 5-10%, 15 Days 15-30%, Monthly 20-50%. These are not guaranteed." },
              { q: "When can I withdraw?", a: "After your investment period completes. Withdrawals process in 2-12 hours using the same deposit method." },
              { q: "Is my money safe?", a: "We use enterprise-grade security. However, all trading carries risk. Never invest more than you can afford to lose." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl border border-border bg-surface-elevated [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium text-sm">
                  {faq.q}
                  <svg className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="border-t border-border px-5 py-4 text-sm text-muted leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-6 py-16 sm:px-12 sm:py-20 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Ready to Start Earning?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-white/80 max-w-md mx-auto">
                Join thousands growing their wealth with AI trading. No experience required.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="/auth/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-sm font-semibold text-primary hover:bg-white/90 transition-colors w-full sm:w-auto"
                >
                  Create Free Account
                </a>
                <a
                  href="/support"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-7 text-sm font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                >
                  Talk to Us
                </a>
              </div>
              <p className="mt-5 text-xs text-white/60">From $5. No commitments. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Disclaimer ─── */}
      <section className="border-t border-border bg-surface/50 px-4 py-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[11px] text-muted leading-relaxed max-w-3xl mx-auto">
            <strong className="text-foreground/60">Risk Disclaimer:</strong> Trading cryptocurrencies involves substantial risk of loss. Past performance is not indicative of future results. Return rates (20–50% monthly, 15–30% for 15 days, 5–10% weekly) are targets based on market conditions - never guaranteed. Only invest what you can afford to lose.
          </p>
        </div>
      </section>
    </div>
  );
}
