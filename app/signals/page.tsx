import type { Metadata } from "next"
import AITradingBrain from "@/components/trading/AITradingBrain"
import Button from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "AI Trading Signals — Live Market Analysis & Signals",
  description:
    "Get real-time AI-powered trading signals for BTC, ETH, and SOL. Our trading brain analyzes RSI, MACD, moving averages, volume, liquidation data, and Fear & Greed to deliver actionable buy, sell, and hold verdicts — updated every 90 seconds.",
  keywords: [
    "AI trading signals",
    "crypto signals",
    "real-time market analysis",
    "BTC signals",
    "ETH signals",
    "SOL signals",
    "trading brain",
    "machine learning trading",
    "crypto market indicators",
    "Binance analysis",
    "fear and greed index",
    "algorithmic trading",
  ],
  openGraph: {
    title: "AI Trading Brain — Live Strategy Checklist & Signals",
    description:
      "Watch our AI analyze live Binance data — RSI, MACD, volume, liquidation pools, and Fear & Greed — to generate real-time buy/hold/sell verdicts for BTC, ETH, and SOL.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Trading Brain — Live Strategy Checklist & Signals",
    description:
      "Real-time AI-powered crypto trading signals. Live analysis of RSI, MACD, moving averages, volume, liquidations, and Fear & Greed.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SignalsPage() {
  return (
    <div className="overflow-hidden">
      {/* ─── SEO Hero ─── */}
      <section className="relative px-4 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-36">
        <div className="hero-glow top-[-200px] left-1/2 -translate-x-1/2" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs font-medium text-primary">
              Live AI Market Intelligence
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            AI-Powered Trading Signals{" "}
            <span className="gradient-text">in Real Time</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto">
            Our AI Trading Brain continuously monitors Binance market data — RSI
            momentum, MACD crossovers, moving averages, volume velocity,
            liquidation clusters, and the Fear &amp; Greed Index — to produce
            actionable buy, hold, and sell verdicts every 90 seconds.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              Live Binance data
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              6 technical indicators
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              BTC &middot; ETH &middot; SOL
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              90s refresh cycle
            </span>
          </div>
        </div>
      </section>

      {/* ─── AI Trading Brain Dashboard ─── */}
      <section>
        <AITradingBrain />
      </section>

      {/* ─── Signal Insights ─── */}
      <section className="border-y border-border bg-surface/30 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              What Our AI Trading Brain Analyzes
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "RSI Momentum",
                desc: "Relative Strength Index identifies overbought and oversold conditions. Our brain flags extreme readings and ideal entry zones with historical context.",
              },
              {
                title: "Moving Averages",
                desc: "MA50/MA200 crossover detection reveals golden cross and death cross patterns — some of the most reliable long-term trend signals in technical analysis.",
              },
              {
                title: "MACD Crossover",
                desc: "Moving Average Convergence Divergence tracks momentum acceleration and deceleration. Histogram expansion confirms trend conviction.",
              },
              {
                title: "Volume Velocity",
                desc: "Real-time volume comparison against 20-period average. High-volume moves carry conviction; low-volume moves are treated with skepticism.",
              },
              {
                title: "Liquidation Pools",
                desc: "Live Binance futures liquidation feed aggregates forced closures by asset and side, revealing where stop-loss clusters and potential reversal zones sit.",
              },
              {
                title: "Fear & Greed Index",
                desc: "Contrarian sentiment gauge from Alternative.me. Extreme fear historically precedes rallies; extreme greed often signals market tops.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-surface-elevated p-5 card-hover"
              >
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to Act on These Signals?
          </h2>
          <p className="mt-4 text-muted leading-relaxed max-w-lg mx-auto">
            Our AI executes trades based on market signals like these — 24/7.
            Deposit funds and let the algorithms work for you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button href="/auth/register" size="lg" className="w-full sm:w-auto">
              Start Earning with AI
            </Button>
            <Button
              href="/#plans"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              View Investment Plans
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
