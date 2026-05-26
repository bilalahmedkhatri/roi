"use client"

import { useEffect } from "react"

export interface AnalysisSnapshot {
  price: number
  change: number
  rsi: number | null
  ma50: number
  ma200: number
  volRatio: number
  pricePos: number
  macdHist: number
  pct: number
  bullCnt: number
  bearCnt: number
  neutCnt: number
}

export type DrawerType =
  | "key-levels"
  | "what-to-wait-for"
  | "entry-strategy"
  | "risk-management"
  | "downside-risks"
  | "how-to-hedge"

const drawerConfig: Record<DrawerType, { title: string }> = {
  "key-levels": { title: "Key Support & Resistance Levels" },
  "what-to-wait-for": { title: "AI Strategy Checklist" },
  "entry-strategy": { title: "Entry Strategy Details" },
  "risk-management": { title: "Risk Management Plan" },
  "downside-risks": { title: "Downside Risk Assessment" },
  "how-to-hedge": { title: "How to Hedge Position" },
}

interface SignalDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  type: DrawerType | ""
  coinPair: string
  data: AnalysisSnapshot | null
}

export default function SignalDetailsDrawer({
  isOpen,
  onClose,
  type,
  coinPair,
  data,
}: SignalDetailsDrawerProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen || !type) return null

  const config = drawerConfig[type]

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-surface-elevated shadow-2xl border-l border-border transition-all duration-300 overflow-y-auto">
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-primary tracking-[.15em] uppercase">
                  {coinPair}
                </span>
                <h2 className="text-lg font-bold text-foreground mt-0.5">
                  {config.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            {type === "key-levels" && <KeyLevelsContent data={data} coinPair={coinPair} />}
            {type === "what-to-wait-for" && <WhatToWaitForContent data={data} />}
            {type === "entry-strategy" && <EntryStrategyContent data={data} coinPair={coinPair} />}
            {type === "risk-management" && <RiskManagementContent data={data} />}
            {type === "downside-risks" && <DownsideRisksContent data={data} coinPair={coinPair} />}
            {type === "how-to-hedge" && <HowToHedgeContent data={data} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function fmt(n: number, d = 2) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
}

function KeyLevelsContent({
  data,
  coinPair,
}: {
  data: AnalysisSnapshot | null
  coinPair: string
}) {
  if (!data) return <LoadingSkeleton />

  const { price, pricePos, change } = data
  const rangeWidth = price / (pricePos / 100 || 1) - price / ((100 - pricePos) / 100 || 1)
  const halfRange = rangeWidth / 2

  const r2 = price + halfRange * 0.618
  const r1 = price + halfRange * 0.382
  const s1 = price - halfRange * 0.382
  const s2 = price - halfRange * 0.618

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted leading-relaxed">
        Algorithmic boundaries for <strong className="text-foreground">{coinPair}</strong> derived from
        current volatility profile and order-flow positioning.
      </p>

      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-[.12em] text-red-500 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Resistance — Take Profit Targets
        </h4>
        <div className="space-y-2">
          <LevelRow label="Major Resistance (R2)" value={r2} color="text-red-500" />
          <LevelRow label="Minor Resistance (R1)" value={r1} color="text-red-400" />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-[.12em] text-emerald-600 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Support — Accumulation / Stop Loss
        </h4>
        <div className="space-y-2">
          <LevelRow label="Immediate Support (S1)" value={s1} color="text-emerald-600" />
          <LevelRow label="Capital Floor (S2)" value={s2} color="text-emerald-500" />
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Current price</span>
          <span className="font-mono font-semibold text-foreground">
            ${fmt(price)} ({change >= 0 ? "+" : ""}
            {change.toFixed(2)}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted mt-1.5">
          <span>24h range position</span>
          <span className="font-mono text-foreground">{pricePos.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

function LevelRow({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center justify-between bg-surface rounded-lg px-4 py-3 border border-border">
      <span className="text-xs font-mono text-muted">{label}</span>
      <span className={`font-mono text-sm font-bold ${color}`}>${fmt(value)}</span>
    </div>
  )
}

function WhatToWaitForContent({ data }: { data: AnalysisSnapshot | null }) {
  if (!data) return <LoadingSkeleton />

  const conditions = buildConditionChecklist(data)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted leading-relaxed">
        The AI model is in a{" "}
        <span className="text-amber-600 font-semibold">defensive hold</span> pattern.
        It is waiting for at least <strong className="text-foreground">3 of 6</strong> parameters to
        align before signalling a directional shift:
      </p>

      <div className="space-y-2.5">
        {conditions.map((c, i) => (
          <ConditionRow key={i} {...c} />
        ))}
      </div>
    </div>
  )
}

function ConditionRow({
  label,
  detail,
  met,
}: {
  label: string
  detail: string
  met: boolean
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg px-4 py-3 border ${
        met
          ? "bg-emerald-50 border-emerald-200"
          : "bg-surface border-border"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          met
            ? "bg-emerald-500 text-white"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {met ? "✓" : "⌛"}
      </span>
      <div>
        <div
          className={`text-sm font-medium ${
            met ? "text-emerald-800 line-through" : "text-foreground"
          }`}
        >
          {label}
        </div>
        <p className="text-xs text-muted mt-0.5">{detail}</p>
      </div>
    </div>
  )
}

function buildConditionChecklist(data: AnalysisSnapshot) {
  return [
    {
      label: "Volume Spike Confirmation",
      detail: data.volRatio >= 1.2
        ? `Achieved — volume is ${data.volRatio.toFixed(2)}× average.`
        : `Current volume ${data.volRatio.toFixed(2)}× average — needs to exceed 1.2×.`,
      met: data.volRatio >= 1.2,
    },
    {
      label: "RSI Cool-down",
      detail: data.rsi !== null && data.rsi <= 50
        ? `Completed — RSI at ${data.rsi.toFixed(1)}.`
        : `RSI at ${data.rsi?.toFixed(1) ?? "—"} — needs to drop below 50 for ideal re-entry.`,
      met: data.rsi !== null && data.rsi <= 50,
    },
    {
      label: "MACD Histogram Inflection",
      detail: data.macdHist > 0
        ? `Completed — histogram is positive (${data.macdHist.toFixed(5)}).`
        : `Histogram at ${data.macdHist.toFixed(5)} — needs to cross above zero.`,
      met: data.macdHist > 0,
    },
    {
      label: "Price Above MA50",
      detail: data.price > data.ma50
        ? `Confirmed — price is above the 50-period MA.`
        : `Price is below MA50 ($${fmt(data.ma50)}) — needs to reclaim this level.`,
      met: data.price > data.ma50,
    },
    {
      label: "Range Position Recovery",
      detail: data.pricePos >= 40
        ? `Price at ${data.pricePos.toFixed(0)}% of range — above danger zone.`
        : `Price at ${data.pricePos.toFixed(0)}% of range — needs to climb past 40%.`,
      met: data.pricePos >= 40,
    },
    {
      label: "Momentum Score Signal",
      detail: data.pct >= 50
        ? `Overall score ${data.pct}% — sufficient conviction.`
        : `Score at ${data.pct}% — needs to reach 50%+ for confident entry.`,
      met: data.pct >= 50,
    },
  ]
}

function EntryStrategyContent({
  data,
  coinPair,
}: {
  data: AnalysisSnapshot | null
  coinPair: string
}) {
  if (!data) return <LoadingSkeleton />

  const { price, rsi, volRatio, pct } = data
  const conviction = pct >= 75 ? "High" : pct >= 60 ? "Moderate" : "Cautious"

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted leading-relaxed">
        Execution strategy for <strong className="text-foreground">{coinPair}</strong> based on current
        signal alignment ({pct}%).
      </p>

      <div className="space-y-2">
        <DetailRow label="Conviction Level" value={conviction} />
        <DetailRow label="Suggested Entry" value={`$${fmt(price)} — limit or market`} />
        <DetailRow label="Position Size" value={conviction === "High" ? "2-3% of portfolio" : "1-1.5% of portfolio"} />
        <DetailRow label="RSI Confirmation" value={rsi !== null ? `RSI ${rsi.toFixed(1)} — ${rsi < 45 ? "oversold bias" : rsi > 65 ? "overbought bias" : "neutral"}` : "—"} />
        <DetailRow label="Volume Support" value={volRatio >= 1.2 ? `Volume ${volRatio.toFixed(2)}× avg — confirmed` : `Volume ${volRatio.toFixed(2)}× avg — weak`} />
      </div>
    </div>
  )
}

function RiskManagementContent({ data }: { data: AnalysisSnapshot | null }) {
  if (!data) return <LoadingSkeleton />

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted leading-relaxed">
        Multi-layer risk controls to protect capital during this position.
      </p>

      <div className="space-y-2">
        <DetailRow label="Stop Loss" value="3-5% below entry — hard stop" />
        <DetailRow label="Take Profit 1" value="R1 level — 50% position" />
        <DetailRow label="Take Profit 2" value="R2 level — remaining 50%" />
        <DetailRow label="Max Drawdown" value="8% daily — auto-circuit" />
        <DetailRow label="Rebuy Trigger" value="Price reclaims MA50 on 4H" />
      </div>
    </div>
  )
}

function DownsideRisksContent({
  data,
  coinPair,
}: {
  data: AnalysisSnapshot | null
  coinPair: string
}) {
  if (!data) return <LoadingSkeleton />

  const { price, ma50, ma200, pct } = data
  const risks: { label: string; desc: string; severity: "high" | "medium" | "low" }[] = [
    {
      label: "Trend Reversal",
      desc: price < ma50
        ? `${coinPair} is trading below MA50 — short-term trend is bearish.`
        : "Price above MA50 — short-term trend intact.",
      severity: price < ma50 ? "high" : "low",
    },
    {
      label: "Death Cross Risk",
      desc: ma50 < ma200
        ? `MA50 below MA200 — long-term structure is deteriorating.`
        : "Golden cross structure — long-term bullish.",
      severity: ma50 < ma200 ? "high" : "low",
    },
    {
      label: "Volume Exhaustion",
      desc: `Volume ratio at ${data.volRatio.toFixed(2)}× average — ${data.volRatio < 0.7 ? "significant weakness" : data.volRatio < 1.3 ? "moderate" : "strong"}.`,
      severity: data.volRatio < 0.7 ? "high" : data.volRatio < 1.3 ? "medium" : "low",
    },
    {
      label: "Signal Fragility",
      desc: `Only ${data.bullCnt} of 6 indicators bullish at ${pct}% conviction.`,
      severity: pct < 40 ? "high" : pct < 60 ? "medium" : "low",
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted leading-relaxed">
        Key risk factors identified for <strong className="text-foreground">{coinPair}</strong>:
      </p>
      {risks.map((r, i) => (
        <div
          key={i}
          className={`rounded-lg px-4 py-3 border ${
            r.severity === "high"
              ? "bg-red-50 border-red-200"
              : r.severity === "medium"
                ? "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                r.severity === "high"
                  ? "bg-red-500"
                  : r.severity === "medium"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
              {r.label}
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">{r.desc}</p>
        </div>
      ))}
    </div>
  )
}

function HowToHedgeContent({ data }: { data: AnalysisSnapshot | null }) {
  if (!data) return <LoadingSkeleton />

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted leading-relaxed">
        If you must stay exposed, use these hedging strategies to reduce downside:
      </p>

      <div className="space-y-2.5">
        <HedgeRow
          num="01"
          title="Reduce Position Size"
          desc="Trim 30-50% of your position until the overall score improves above 50%."
        />
        <HedgeRow
          num="02"
          title="Set Tighter Stops"
          desc="Move stop-loss to 2% below current price instead of the usual 4-5%."
        />
        <HedgeRow
          num="03"
          title="Diversify Across Pairs"
          desc="Allocate to assets with neutral or bullish signals to offset directional risk."
        />
        <HedgeRow
          num="04"
          title="Stablecoin Hedge"
          desc="Convert 20-30% of portfolio to USDT/USDC to reduce overall market exposure."
        />
        <HedgeRow
          num="05"
          title="Wait for Confirmation"
          desc="Do not open new positions until at least 4 of 6 indicators align."
        />
      </div>
    </div>
  )
}

function HedgeRow({
  num,
  title,
  desc,
}: {
  num: string
  title: string
  desc: string
}) {
  return (
    <div className="flex gap-3 rounded-lg bg-surface px-4 py-3 border border-border">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
        {num}
      </span>
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <p className="text-xs text-muted mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3 border border-border">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-semibold text-foreground font-mono">{value}</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-surface rounded w-3/4" />
      <div className="h-12 bg-surface rounded" />
      <div className="h-12 bg-surface rounded" />
      <div className="h-12 bg-surface rounded" />
    </div>
  )
}
