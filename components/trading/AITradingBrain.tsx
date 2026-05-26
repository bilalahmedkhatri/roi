"use client"

import { useEffect, useState } from "react"
import SignalDetailsDrawer, {
  type AnalysisSnapshot,
  type DrawerType,
} from "./SignalDetailsDrawer"

let sym = "BTCUSDT"
let base = "BTC"
let scanning = false
let fngCache: { d: any; ts: number } | null = null
let liqEvents: { s: string; side: string; usd: number; ts: number }[] = []
let liqWS: WebSocket | null = null

let openDrawer: ((type: DrawerType, pair: string) => void) | null = null
let updateSnapshot: ((data: AnalysisSnapshot) => void) | null = null

function fmt(n: number, d = 2) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
}

function fmtK(n: number) {
  return n >= 1e9
    ? (n / 1e9).toFixed(2) + "B"
    : n >= 1e6
      ? (n / 1e6).toFixed(2) + "M"
      : n >= 1e3
        ? (n / 1e3).toFixed(1) + "K"
        : n.toFixed(0)
}

function iconHTML(name: string, size = 14) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px;display:inline-flex;vertical-align:middle;"></i>`
}

function labelWithIcon(name: string, text: string) {
  return `${iconHTML(name, 11)}<span style="margin-left:4px">${text}</span>`
}

function setTS() {
  const el = document.getElementById("ts")
  if (el)
    el.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
}

function showErr(msg: string) {
  const box = document.getElementById("err-box")
  if (!box) return
  box.style.display = "flex"
  box.innerHTML = `${iconHTML("alert-circle", 14)} <span style="margin-left:6px">${msg}</span>`
  try {
    ; (window as any).lucide.createIcons({
      nodes: [box.querySelector("[data-lucide]")],
    })
  } catch { }
  setTimeout(() => (box.style.display = "none"), 9000)
}

function selectTicker(s: string, b: string) {
  if (scanning) return
    ;["BTC", "ETH", "SOL"].forEach((t) =>
      document.getElementById("btn-" + t)?.classList.remove("active"),
    )
  document.getElementById("btn-" + b)?.classList.add("active")
  sym = s
  base = b
  runAnalysis()
}

function connectLiqWS() {
  if (liqWS) {
    try {
      liqWS.close()
    } catch { }
  }
  liqWS = new WebSocket("wss://fstream.binance.com/ws/!forceOrder@arr")
  liqWS.onmessage = (e) => {
    try {
      const o = JSON.parse(e.data).o
      if (!o) return
      const s = o.s.replace("USDT", "")
      const side = o.S === "SELL" ? "long" : "short"
      const usd = parseFloat(o.p) * parseFloat(o.q)
      if (usd < 5000) return
      liqEvents.unshift({ s, side, usd, ts: Date.now() })
      if (liqEvents.length > 80) liqEvents.pop()
      updateLiqTicker()
    } catch { }
  }
  liqWS.onerror = () => { }
  liqWS.onclose = () => setTimeout(connectLiqWS, 5000)
}

function updateLiqTicker() {
  const items = liqEvents.slice(0, 24)
  if (!items.length) return
  const doubled = [...items, ...items]
  const inner = document.getElementById("liq-inner")
  if (inner)
    inner.innerHTML = doubled
      .map(
        (l) =>
          `<span class="liq-item"><span class="liq-sym">${l.s}</span><span class="liq-${l.side}">$${fmtK(l.usd)} ${l.side.toUpperCase()} liq</span></span>`,
      )
      .join("")
}

async function fetchTicker(s: string) {
  const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`)
  return r.json()
}

async function fetchKlines(s: string, i = "1h", l = 200) {
  const r = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${s}&interval=${i}&limit=${l}`,
  )
  return r.json()
}

async function fetchFNG() {
  if (fngCache && Date.now() - fngCache.ts < 300000) return fngCache.d
  const r = await fetch("https://api.alternative.me/fng/?limit=1")
  const d = await r.json()
  fngCache = { d: d.data[0], ts: Date.now() }
  return d.data[0]
}

function calcRSI(c: number[], p = 14) {
  if (c.length < p + 1) return null
  let g = 0, l = 0
  for (let i = 1; i <= p; i++) {
    const d = c[i] - c[i - 1]
    if (d > 0) g += d
    else l += Math.abs(d)
  }
  let ag = g / p, al = l / p
  for (let i = p + 1; i < c.length; i++) {
    const d = c[i] - c[i - 1]
    ag = (ag * (p - 1) + (d > 0 ? d : 0)) / p
    al = (al * (p - 1) + (d < 0 ? Math.abs(d) : 0)) / p
  }
  return al === 0 ? 100 : 100 - 100 / (1 + ag / al)
}

function calcEMA(d: number[], p: number) {
  const k = 2 / (p + 1)
  let e = d.slice(0, p).reduce((a, b) => a + b, 0) / p
  const r: number[] = []
  for (let i = p; i < d.length; i++) {
    e = d[i] * k + e * (1 - k)
    r.push(e)
  }
  return r
}

function calcMACD(c: number[]) {
  if (c.length < 35) return null
  const e12 = calcEMA(c, 12), e26 = calcEMA(c, 26)
  const len = Math.min(e12.length, e26.length)
  const ml: number[] = []
  for (let i = 0; i < len; i++)
    ml.push(e12[e12.length - len + i] - e26[e26.length - len + i])
  const sig = calcEMA(ml, 9)
  const h = ml.slice(ml.length - sig.length).map((v, i) => v - sig[i])
  return {
    macd: ml[ml.length - 1],
    signal: sig[sig.length - 1],
    hist: h[h.length - 1],
    prevHist: h[h.length - 2],
  }
}

function calcSMA(d: number[], p: number) {
  return d.slice(-p).reduce((a, b) => a + b, 0) / p
}

function makeCheck(
  iconName: string,
  name: string,
  detail: string,
  explain: string,
  status: string,
  tag: string,
  delay: number,
) {
  const sMap: Record<string, string> = {
    green: "s-green",
    red: "s-red",
    amber: "s-amber",
    neutral: "",
  }
  const ciMap: Record<string, string> = {
    green: "ci-green",
    red: "ci-red",
    amber: "ci-amber",
    neutral: "ci-neutral",
  }
  const tgMap: Record<string, string> = {
    green: "tg-green",
    red: "tg-red",
    amber: "tg-amber",
    neutral: "tg-neutral",
  }

  const row = document.createElement("div")
  row.className = `chk ${sMap[status] || ""}`
  row.style.animationDelay = delay + "ms"

  const iconDiv = document.createElement("div")
  iconDiv.className = `chk-icon ${ciMap[status] || "ci-neutral"}`
  iconDiv.innerHTML = iconHTML(iconName, 15)

  const body = document.createElement("div")
  body.className = "chk-body"
  body.innerHTML = `<div class="chk-name">${name}</div><div class="chk-detail">${detail}</div><div class="chk-explain">${explain}</div>`

  const tagEl = document.createElement("div")
  tagEl.className = `chk-tag ${tgMap[status] || "tg-neutral"}`
  tagEl.textContent = tag

  row.appendChild(iconDiv)
  row.appendChild(body)
  row.appendChild(tagEl)
  return row
}

function makeScanning(name: string, delay: number) {
  const row = document.createElement("div")
  row.className = "chk"
  row.style.animationDelay = delay + "ms"
  row.innerHTML = `
    <div class="chk-icon ci-neutral" style="animation: blink 1s ease-in-out infinite">${iconHTML("loader", 15)}</div>
    <div class="chk-body">
      <div class="chk-name">${name}</div>
      <div class="chk-detail" style="color:var(--text3);font-size:12px">Scanning live data…</div>
    </div>
    <div class="chk-tag tg-neutral">—</div>`
  return row
}

async function runAnalysis() {
  if (scanning) return
  scanning = true

  const btn = document.getElementById("rescan-btn") as HTMLButtonElement | null
  if (btn) btn.disabled = true
  const ico = document.getElementById("rescan-ico")
  if (ico) {
    ico.innerHTML = `<i data-lucide="loader" style="width:14px;height:14px;animation:spin .7s linear infinite;"></i>`
    try {
      ; (window as any).lucide.createIcons({
        nodes: [ico.querySelector("[data-lucide]")],
      })
    } catch { }
  }

  document.getElementById("verdict")!.className = "verdict"
  const scoreNum = document.getElementById("score-num")
  if (scoreNum) {
    scoreNum.textContent = "—"
    scoreNum.style.color = "var(--text3)"
  }
  const scoreFill = document.getElementById("score-fill")
  if (scoreFill) scoreFill.style.width = "0"
    ;["sb-bull", "sb-neut", "sb-bear"].forEach((id) => {
      const el = document.getElementById(id)
      if (el) el.textContent = "—"
    })
    ;["pp-price", "pp-change", "pp-vol", "pp-fng"].forEach((id) => {
      const e = document.getElementById(id)
      if (e) {
        e.className = "p-val load"
        e.textContent = "…"
      }
    })

  const checks = document.getElementById("checks")!
  checks.innerHTML = ""
    ;[
      "RSI momentum",
      "Moving averages",
      "MACD crossover",
      "Volume",
      "Liquidation range",
      "Fear & greed",
    ].forEach((n, i) => checks.appendChild(makeScanning(n, i * 55)))

  try {
    const [ticker, k1h, k4h, fng] = await Promise.all([
      fetchTicker(sym),
      fetchKlines(sym, "1h", 200),
      fetchKlines(sym, "4h", 200),
      fetchFNG().catch(() => null),
    ])

    const price = parseFloat(ticker.lastPrice)
    const change = parseFloat(ticker.priceChangePercent)
    const vol = parseFloat(ticker.quoteVolume)

    const pe = document.getElementById("pp-price")
    if (pe) {
      pe.textContent = "$" + fmt(price)
      pe.className = "p-val"
    }

    const ce = document.getElementById("pp-change")
    if (ce) {
      ce.textContent = (change >= 0 ? "+" : "") + change.toFixed(2) + "%"
      ce.className = "p-val " + (change >= 0 ? "up" : "dn")
    }

    const ve = document.getElementById("pp-vol")
    if (ve) {
      ve.textContent = "$" + fmtK(vol)
      ve.className = "p-val"
    }

    if (fng) {
      const fe = document.getElementById("pp-fng")
      if (fe) {
        const fv = parseInt(fng.value)
        fe.textContent = fng.value + " — " + fng.value_classification
        fe.className = "p-val " + (fv <= 30 ? "dn" : fv >= 65 ? "up" : "")
      }
    }
    setTS()

    const c1h = k1h.map((k: any) => parseFloat(k[4]))
    const v1h = k1h.map((k: any) => parseFloat(k[5]))
    const high1h = k1h.map((k: any) => parseFloat(k[2]))
    const low1h = k1h.map((k: any) => parseFloat(k[3]))
    const rsi = calcRSI(c1h, 14)
    const macd = calcMACD(c1h)
    const ma50 = calcSMA(c1h, 50)
    const ma200 = calcSMA(c1h, 200)
    const avgVol = v1h.slice(-20, -1).reduce((a: number, b: number) => a + b, 0) / 19
    const curVol = v1h[v1h.length - 1]
    const volRatio = curVol / avgVol
    const curPrice = c1h[c1h.length - 1]
    const recentLow = Math.min(...low1h.slice(-24))
    const recentHigh = Math.max(...high1h.slice(-24))
    const pricePos = ((curPrice - recentLow) / (recentHigh - recentLow)) * 100

    await new Promise((r) => setTimeout(r, 60))
    checks.innerHTML = ""

    let score = 0, bullCnt = 0, bearCnt = 0, neutCnt = 0

    let rs: string, rt: string, rd: string, re: string
    if (rsi === null) {
      rs = "neutral"; rt = "No data"
      rd = "Insufficient candle data"
      re = "Need at least 15 candles to compute RSI. Try again shortly."
      neutCnt++
    } else if (rsi > 75) {
      rs = "red"; rt = "Overbought"; bearCnt++
      rd = `RSI ${rsi.toFixed(1)} — Extremely overbought`
      re = 'RSI above 75 is a strong overbought signal. Price is running hot and a pullback is statistically likely. Avoid new long entries — wait for RSI to cool below 60 before considering a buy.'
    } else if (rsi > 65) {
      rs = "amber"; rt = "Elevated"; score += 1; neutCnt++
      rd = `RSI ${rsi.toFixed(1)} — Approaching overbought`
      re = 'RSI is elevated but not yet extreme. Existing positions are fine to hold, but opening new longs here carries elevated reversal risk. Tighten stop losses.'
    } else if (rsi < 30) {
      rs = "green"; rt = "Oversold"; score += 2; bullCnt++
      rd = `RSI ${rsi.toFixed(1)} — Oversold, bounce likely`
      re = 'RSI below 30 is a classic oversold reading — one of the strongest buy signals. Historically prices bounce from here. Wait for the first green candle as confirmation before entering.'
    } else if (rsi < 45) {
      rs = "green"; rt = "Healthy zone"; score += 2; bullCnt++
      rd = `RSI ${rsi.toFixed(1)} — Ideal entry range`
      re = 'RSI is in an ideal range — enough room to run before becoming overbought. This is the sweet spot for new long entries with favorable risk/reward.'
    } else {
      rs = "green"; rt = "Neutral"; score += 1; bullCnt++
      rd = `RSI ${rsi.toFixed(1)} — Balanced momentum`
      re = 'RSI shows no extremes in either direction. Market momentum is balanced.'
    }
    checks.appendChild(makeCheck("activity", "RSI (14) — overbought check", rd, re, rs, rt, 0))
    await new Promise((r) => setTimeout(r, 110))

    const maDiff = ((ma50 - ma200) / ma200) * 100
    let ms: string, mt: string, md: string, me: string
    if (ma50 > ma200) {
      if (maDiff > 3) {
        ms = "green"; mt = "Golden cross"; score += 2; bullCnt++
        md = `MA50 is ${maDiff.toFixed(1)}% above MA200`
        me = 'A well-established golden cross: the 50-period MA is comfortably above the 200-period MA. This is one of the most reliable long-term bullish signals.'
      } else {
        ms = "green"; mt = "Early cross"; score += 1; bullCnt++
        md = `MA50 just crossed above MA200 (+${maDiff.toFixed(2)}%)`
        me = 'A fresh golden cross is forming. Early crossovers are promising but can produce fake-outs.'
      }
    } else {
      if (Math.abs(maDiff) < 1.5) {
        ms = "amber"; mt = "Converging"; score += 1; neutCnt++
        md = `MA50 is ${Math.abs(maDiff).toFixed(2)}% below MA200`
        me = 'The two moving averages are converging fast — a crossover in either direction is imminent.'
      } else {
        ms = "red"; mt = "Death cross"; bearCnt++
        md = `MA50 is ${Math.abs(maDiff).toFixed(1)}% below MA200`
        me = 'A confirmed death cross: MA50 has fallen below MA200. This signals a broader bearish trend.'
      }
    }
    checks.appendChild(makeCheck("trending-up", "Moving average crossover (MA50/MA200)", md, me, ms, mt, 80))
    await new Promise((r) => setTimeout(r, 110))

    let mcs: string, mct: string, mcd: string, mce: string
    if (!macd) {
      mcs = "neutral"; mct = "No data"; neutCnt++
      mcd = "Insufficient data for MACD"
      mce = 'More candle history is needed to compute MACD.'
    } else if (macd.hist > 0 && macd.prevHist > 0 && macd.hist > macd.prevHist) {
      mcs = "green"; mct = "Accelerating"; score += 2; bullCnt++
      mcd = `Histogram rising: +${macd.hist.toFixed(5)}`
      mce = 'MACD histogram is positive AND expanding — both direction and velocity confirm bulls are in control.'
    } else if (macd.hist > 0) {
      mcs = "green"; mct = "Bullish cross"; score += 1; bullCnt++
      mcd = `MACD above signal line (+${macd.hist.toFixed(5)})`
      mce = 'MACD has crossed above its signal line — a buy signal.'
    } else if (macd.hist < 0 && macd.hist > macd.prevHist) {
      mcs = "amber"; mct = "Recovering"; score += 1; neutCnt++
      mcd = `Histogram negative but improving (${macd.hist.toFixed(5)})`
      mce = 'MACD is still below zero but the histogram is narrowing — bearish momentum is fading.'
    } else {
      mcs = "red"; mct = "Bearish"; bearCnt++
      mcd = `MACD below signal line (${macd.hist.toFixed(5)})`
      mce = 'MACD is below its signal line — downward momentum is dominant.'
    }
    checks.appendChild(makeCheck("git-commit-horizontal", "MACD momentum signal", mcd, mce, mcs, mct, 160))
    await new Promise((r) => setTimeout(r, 110))

    let vs: string, vt: string, vd: string, ve2: string
    const vr = volRatio.toFixed(2)
    if (volRatio > 2.5) {
      vs = "green"; vt = "High volume"; score += 2; bullCnt++
      vd = `${vr}× average volume — strong conviction`
      ve2 = 'Volume is significantly above average — the most important confirmation signal.'
    } else if (volRatio > 1.3) {
      vs = "green"; vt = "Above average"; score += 1; bullCnt++
      vd = `${vr}× average volume — move confirmed`
      ve2 = 'Volume is above average — price moves are supported by real buying/selling interest.'
    } else if (volRatio > 0.7) {
      vs = "amber"; vt = "Low conviction"; neutCnt++
      vd = `${vr}× average volume — weak confirmation`
      ve2 = 'Volume is near or below average — any price movement here lacks conviction.'
    } else {
      vs = "red"; vt = "Very low"; bearCnt++
      vd = `${vr}× average volume — no conviction`
      ve2 = 'Volume is far below average. This market is quiet and moves can reverse easily.'
    }
    checks.appendChild(makeCheck("bar-chart-2", "Volume confirmation", vd, ve2, vs, vt, 240))
    await new Promise((r) => setTimeout(r, 110))

    let ls: string, lt: string, ld: string, le: string
    const last8c = ((curPrice - c1h[c1h.length - 9]) / c1h[c1h.length - 9]) * 100
    const recentLiqUSD = liqEvents
      .filter((e) => e.s === base && Date.now() - e.ts < 120000)
      .reduce((s, e) => s + e.usd, 0)

    if (pricePos > 72 && last8c > 1.5) {
      ls = "green"; lt = "Pools cleared"; score += 2; bullCnt++
      ld = `Price at ${pricePos.toFixed(0)}% of 24h range with upward momentum`
      le = 'Price is in the upper quarter of its 24-hour range with positive momentum.'
    } else if (pricePos > 55) {
      ls = "green"; lt = "Range high"; score += 1; bullCnt++
      ld = `Price at ${pricePos.toFixed(0)}% of 24h range — above midpoint`
      le = 'Price is holding above the midpoint of its recent range — a sign of relative strength.'
    } else if (pricePos > 35) {
      ls = "amber"; lt = "Mid-range"; score += 1; neutCnt++
      ld = `Price at ${pricePos.toFixed(0)}% of 24h range — neutral zone`
      le = 'Price is in the middle of its range — no directional edge from range position alone.'
    } else {
      ls = "red"; lt = "Near range low"; bearCnt++
      ld = `Price at ${pricePos.toFixed(0)}% of 24h range — near lows`
      le = 'Price is near the bottom of its recent range — overhead liquidation pools remain intact.'
    }
    if (recentLiqUSD > 0)
      le += ` Live data: $${fmtK(recentLiqUSD)} in ${base} liquidations in the last 2 minutes.`
    checks.appendChild(makeCheck("droplets", "Liquidation pool position", ld, le, ls, lt, 320))
    await new Promise((r) => setTimeout(r, 110))

    let fs: string, ft: string, fd: string, fe: string
    if (fng) {
      const fv = parseInt(fng.value)
      if (fv <= 20) {
        fs = "green"; ft = "Extreme fear"; score += 2; bullCnt++
        fd = `${fng.value} — ${fng.value_classification}`
        fe = 'Extreme Fear is historically one of the best contrarian buy signals in crypto.'
      } else if (fv <= 40) {
        fs = "amber"; ft = "Fear"; score += 1; neutCnt++
        fd = `${fng.value} — ${fng.value_classification}`
        fe = 'The market is fearful but not at extremes.'
      } else if (fv <= 60) {
        fs = "green"; ft = "Neutral"; score += 1; bullCnt++
        fd = `${fng.value} — ${fng.value_classification}`
        fe = 'Balanced sentiment with neither excessive fear nor greed.'
      } else if (fv <= 75) {
        fs = "amber"; ft = "Greed"; neutCnt++
        fd = `${fng.value} — ${fng.value_classification}`
        fe = 'Greed is elevated. Markets can continue higher but the probability of a correction is rising.'
      } else {
        fs = "red"; ft = "Extreme greed"; bearCnt++
        fd = `${fng.value} — ${fng.value_classification}`
        fe = 'Extreme Greed is a contrarian warning signal. Markets are often overextended.'
      }
    } else {
      fs = "neutral"; ft = "Unavailable"; neutCnt++
      fd = "Fear & Greed API offline"
      fe = 'Could not fetch the Fear & Greed index.'
    }
    checks.appendChild(makeCheck("gauge", "Fear & greed sentiment index", fd, fe, fs, ft, 400))
    await new Promise((r) => setTimeout(r, 300))

    try {
      ; (window as any).lucide.createIcons({
        nodes: Array.from(document.getElementById("checks")!.querySelectorAll("[data-lucide]")),
      })
    } catch { }

    const maxScore = 12
    const pct = Math.round((score / maxScore) * 100)
    const sn = document.getElementById("score-num")
    if (sn) {
      sn.textContent = pct + "%"
      let fillColor: string
      if (pct >= 60) {
        fillColor = "var(--green)"
        sn.style.color = "var(--green)"
      } else if (pct >= 35) {
        fillColor = "var(--amber)"
        sn.style.color = "var(--amber)"
      } else {
        fillColor = "var(--red)"
        sn.style.color = "var(--red)"
      }
      const sf = document.getElementById("score-fill")
      if (sf) {
        sf.style.background = fillColor
        sf.style.width = pct + "%"
      }
    }
    ;["sb-bull", "sb-neut", "sb-bear"].forEach((id, i) => {
      const el = document.getElementById(id)
      if (el) el.textContent = [bullCnt, neutCnt, bearCnt][i].toString()
    })

    const vc = document.getElementById("verdict")
    const viEl = document.getElementById("v-icon")
    const vtEl = document.getElementById("v-title")
    const vsEl = document.getElementById("v-sub")
    const vaEl = document.getElementById("v-actions")

    let vClass: string, vIcon: string, vTitle: string, vSub: string
    const vActions: { icon: string; label: string }[] = []

    if (pct >= 60) {
      vClass = "v-buy"; vIcon = "trending-up"
      vTitle = `⚡ AI verdict: Execute buy — ${base}/USDT`
      vSub = `${score}/${maxScore} signals aligned. ${bullCnt} of 6 indicators are bullish. Risk/reward favors a long entry.`
      vActions.push({ icon: "map-pin", label: "Entry strategy" }, { icon: "shield", label: "Risk management" })
    } else if (pct >= 35) {
      vClass = "v-hold"; vIcon = "minus-circle"
      vTitle = `⏸ AI verdict: Wait — mixed signals on ${base}/USDT`
      vSub = `${score}/${maxScore} signals aligned. ${bullCnt} bullish, ${bearCnt} bearish, ${neutCnt} neutral.`
      vActions.push({ icon: "clock", label: "What to wait for" }, { icon: "search", label: "Key levels" })
    } else {
      vClass = "v-sell"; vIcon = "trending-down"
      vTitle = `🔻 AI verdict: Avoid — bearish structure on ${base}/USDT`
      vSub = `${score}/${maxScore} signals aligned. ${bearCnt} of 6 indicators are bearish.`
      vActions.push({ icon: "alert-triangle", label: "Downside risks" }, { icon: "shield-off", label: "How to hedge" })
    }

    if (vc) vc.className = `verdict show ${vClass}`
    if (viEl) {
      viEl.className = `v-icon vi-${vClass.replace("v-", "")}`
      viEl.innerHTML = iconHTML(vIcon, 20)
    }
    if (vtEl) vtEl.textContent = vTitle
    if (vsEl) vsEl.textContent = vSub
    if (vaEl) {
      vaEl.innerHTML = ""
      vActions.forEach((a) => {
        const btn = document.createElement("button")
        btn.className = "v-act"
        btn.innerHTML = `${iconHTML(a.icon, 12)} <span style="margin-left:4px">${a.label} ↗</span>`
        const drawerType: Record<string, DrawerType> = {
          "Entry strategy": "entry-strategy",
          "Risk management": "risk-management",
          "What to wait for": "what-to-wait-for",
          "Key levels": "key-levels",
          "Downside risks": "downside-risks",
          "How to hedge": "how-to-hedge",
        }
        btn.onclick = () => {
          const dt = drawerType[a.label]
          if (dt && openDrawer) openDrawer(dt, base + "/USDT")
        }
        vaEl.appendChild(btn)
      })
    }

    if (vc) {
      try {
        ; (window as any).lucide.createIcons({
          nodes: Array.from(vc.querySelectorAll("[data-lucide]")),
        })
      } catch { }
    }

    if (updateSnapshot) {
      updateSnapshot({
        price,
        change,
        rsi,
        ma50,
        ma200,
        volRatio,
        pricePos,
        macdHist: macd?.hist ?? 0,
        pct,
        bullCnt,
        bearCnt,
        neutCnt,
      })
    }
  } catch (err: any) {
    showErr("API error: " + err.message)
  }

  if (btn) btn.disabled = false
  const ico2 = document.getElementById("rescan-ico")
  if (ico2) {
    ico2.innerHTML = `<i data-lucide="refresh-cw" style="width:14px;height:14px;display:inline-flex;"></i>`
    try {
      ; (window as any).lucide.createIcons({
        nodes: [ico2.querySelector("[data-lucide]")],
      })
    } catch { }
  }
  scanning = false
}

function initStaticIcons() {
  function renderIcon(containerId: string, name: string, size = 16) {
    const el = document.getElementById(containerId)
    if (!el) return
    el.innerHTML = `<i data-lucide="${name}" style="width:${size}px;height:${size}px;display:inline-flex;"></i>`
    try {
      ; (window as any).lucide.createIcons({
        nodes: [el.querySelector("[data-lucide]")],
      })
    } catch { }
  }

  renderIcon("brain-wrap", "brain", 20)
  renderIcon("ic-BTC", "bitcoin", 14)
  renderIcon("ic-ETH", "zap", 14)
  renderIcon("ic-SOL", "sun", 14)
  renderIcon("rescan-ico", "refresh-cw", 14)

  const lblPrice = document.getElementById("lbl-price")
  if (lblPrice) lblPrice.innerHTML = labelWithIcon("dollar-sign", "Price")
  const lblChange = document.getElementById("lbl-change")
  if (lblChange) lblChange.innerHTML = labelWithIcon("trending-up", "24h change")
  const lblVol = document.getElementById("lbl-vol")
  if (lblVol) lblVol.innerHTML = labelWithIcon("bar-chart-2", "24h volume")
  const lblFng = document.getElementById("lbl-fng")
  if (lblFng) lblFng.innerHTML = labelWithIcon("gauge", "Fear & greed")
  const scoreLbl = document.getElementById("score-lbl-el")
  if (scoreLbl) scoreLbl.innerHTML = labelWithIcon("activity", "Bull signal strength")

  try {
    ; (window as any).lucide.createIcons()
  } catch { }
}

export default function AITradingBrain() {
  const [drawer, setDrawer] = useState<{
    isOpen: boolean
    type: DrawerType | ""
    coinPair: string
  }>({ isOpen: false, type: "", coinPair: "" })
  const [snapshot, setSnapshot] = useState<AnalysisSnapshot | null>(null)

  useEffect(() => {
    openDrawer = (type, pair) => setDrawer({ isOpen: true, type, coinPair: pair })
    updateSnapshot = setSnapshot

    const script = document.createElement("script")
    script.src = "https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"
    script.async = true
    script.onload = () => {
      initStaticIcons()
      connectLiqWS()
      runAnalysis()
    }
    document.head.appendChild(script)

    const interval = setInterval(() => {
      if (!scanning) runAnalysis()
    }, 90000)

    return () => {
      openDrawer = null
      updateSnapshot = null
      if (liqWS) liqWS.close()
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      <style>{`
        :root {
          --bg: var(--background);
          --bg2: var(--surface);
          --bg3: var(--surface-elevated);
          --border: var(--border-color);
          --border2: var(--border-color);
          --green: #059669;
          --green-bg: rgba(5,150,105,0.1);
          --green-border: rgba(5,150,105,0.28);
          --red: #dc2626;
          --red-bg: rgba(220,38,38,0.1);
          --red-border: rgba(220,38,38,0.28);
          --amber: #d97706;
          --amber-bg: rgba(217,119,6,0.1);
          --amber-border: rgba(217,119,6,0.26);
          --blue: #2563eb;
          --blue-bg: rgba(37,99,235,0.1);
          --text: var(--foreground);
          --text2: var(--muted);
          --text3: var(--muted);
          --radius: 10px;
          --radius-sm: 7px;
        }

        .brain-pulse { animation: brainPulse 3s ease-in-out infinite; }
        @keyframes brainPulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,232,162,0)} 50%{box-shadow:0 0 0 6px rgba(0,232,162,0.08)} }

        .blink { animation: blink 1.4s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.65)} }

        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
        @keyframes marquee { 0%{left:0} 100%{left:-50%} }
        .marquee { animation: marquee 30s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .chk { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:13px 16px; display:grid; grid-template-columns:34px 1fr auto; align-items:start; gap:13px; opacity:0; transform:translateY(8px); animation:fadeUp .35s forwards; transition:border-color .3s; }
        .chk.s-green { border-color:var(--green-border); }
        .chk.s-red { border-color:var(--red-border); }
        .chk.s-amber { border-color:var(--amber-border); }

        .chk-icon { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .chk-icon svg { width:15px; height:15px; }
        .ci-green { background:var(--green-bg); color:var(--green); border:1px solid var(--green-border); }
        .ci-red { background:var(--red-bg); color:var(--red); border:1px solid var(--red-border); }
        .ci-amber { background:var(--amber-bg); color:var(--amber); border:1px solid var(--amber-border); }
        .ci-neutral { background:rgba(0,0,0,.04); color:var(--text3); border:1px solid var(--border); }

        .chk-body { min-width:0; }
        .chk-name { font-size:10px; letter-spacing:.05em; color:var(--text2); margin-bottom:2px; }
        .chk-detail { font-family:var(--font-geist-sans),system-ui,sans-serif; font-size:14px; font-weight:700; color:var(--text); }
        .chk-explain { font-size:11px; color:var(--text2); margin-top:4px; line-height:1.6; }

        .chk-tag { font-size:9px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:3px 9px; border-radius:20px; white-space:nowrap; align-self:start; margin-top:3px; }
        .tg-green { background:var(--green-bg); color:var(--green); border:1px solid var(--green-border); }
        .tg-red { background:var(--red-bg); color:var(--red); border:1px solid var(--red-border); }
        .tg-amber { background:var(--amber-bg); color:var(--amber); border:1px solid var(--amber-border); }
        .tg-neutral { background:rgba(0,0,0,.04); color:var(--text2); border:1px solid var(--border); }

        .p-card { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:11px 13px; }
        .p-lbl { font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:var(--text3); margin-bottom:5px; display:flex; align-items:center; gap:5px; }
        .p-lbl svg { width:11px; height:11px; }
        .p-val { font-family:var(--font-geist-sans),system-ui,sans-serif; font-size:16px; font-weight:700; color:var(--text); }
        .p-val.up { color:var(--green); }
        .p-val.dn { color:var(--red); }
        .p-val.load { color:var(--text3); font-size:13px; font-weight:400; }

        .liq-bar { background:var(--bg3); border:1px solid var(--border); border-radius:var(--radius-sm); height:34px; overflow:hidden; position:relative; }
        .liq-inner { display:flex; gap:28px; white-space:nowrap; position:absolute; top:50%; transform:translateY(-50%); font-size:10px; letter-spacing:.05em; }
        .liq-item { display:flex; align-items:center; gap:6px; }
        .liq-sym { color:var(--text2); }
        .liq-long { color:var(--green); font-weight:700; }
        .liq-short { color:var(--red); font-weight:700; }

        .err-box { display:none; align-items:center; gap:8px; background:var(--red-bg); border:1px solid var(--red-border); border-radius:var(--radius-sm); padding:9px 12px; font-size:11px; color:var(--red); }
        .err-box svg { width:14px; height:14px; flex-shrink:0; }

        .sec-label { font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:var(--text3); display:flex; align-items:center; gap:10px; }
        .sec-label::after { content:''; flex:1; height:1px; background:var(--border); }

        .checks { display:flex; flex-direction:column; gap:7px; }

        .score-wrap { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius); padding:16px 18px; }
        .score-top { display:flex; align-items:center; justify-content:space-between; }
        .score-lbl { font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--text2); display:flex; align-items:center; gap:6px; }
        .score-lbl svg { width:13px; height:13px; }
        .score-num { font-family:var(--font-geist-sans),system-ui,sans-serif; font-size:28px; font-weight:800; color:var(--text3); }
        .score-track { height:4px; background:rgba(0,0,0,.06); border-radius:2px; overflow:hidden; }
        .score-fill { height:100%; border-radius:2px; width:0; transition:width .9s cubic-bezier(.4,0,.2,1); }
        .score-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .sg-item { background:rgba(0,0,0,.03); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px 12px; text-align:center; }
        .sg-val { font-family:var(--font-geist-sans),system-ui,sans-serif; font-size:20px; font-weight:800; }
        .sg-lbl { font-size:9px; letter-spacing:.08em; text-transform:uppercase; color:var(--text3); }

        .verdict { background:var(--bg2); border:1.5px solid var(--border); border-radius:var(--radius); padding:18px 20px; display:grid; grid-template-columns:46px 1fr; align-items:start; gap:16px; opacity:0; transition:opacity .4s; }
        .verdict.show { opacity:1; }
        .verdict.v-buy { background:var(--green-bg); border-color:var(--green-border); }
        .verdict.v-sell { background:var(--red-bg); border-color:var(--red-border); }
        .verdict.v-hold { background:var(--amber-bg); border-color:var(--amber-border); }

        .v-icon { width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .v-icon svg { width:20px; height:20px; }
        .vi-buy { background:var(--green-bg); color:var(--green); border:1px solid var(--green-border); }
        .vi-sell { background:var(--red-bg); color:var(--red); border:1px solid var(--red-border); }
        .vi-hold { background:var(--amber-bg); color:var(--amber); border:1px solid var(--amber-border); }

        .v-title { font-family:var(--font-geist-sans),system-ui,sans-serif; font-size:16px; font-weight:800; letter-spacing:-.01em; }
        .v-buy .v-title { color:var(--green); }
        .v-sell .v-title { color:var(--red); }
        .v-hold .v-title { color:var(--amber); }
        .v-sub { font-size:12px; color:var(--text2); line-height:1.65; }
        .v-actions { display:flex; gap:7px; flex-wrap:wrap; }
        .v-act { display:flex; align-items:center; gap:6px; font-size:11px; padding:6px 12px; border-radius:var(--radius-sm); border:1px solid var(--border2); background:rgba(0,0,0,.03); color:var(--text2); cursor:pointer; font-family:var(--font-geist-mono),monospace; transition:all .15s; text-decoration:none; }
        .v-act:hover { border-color:rgba(0,0,0,.25); color:var(--text); }
        .v-act svg { width:12px; height:12px; }

        .rescan-btn { display:flex; align-items:center; gap:8px; padding:11px 26px; border-radius:var(--radius-sm); border:1px solid var(--border2); background:transparent; color:var(--text2); font-family:var(--font-geist-mono),monospace; font-size:12px; font-weight:700; letter-spacing:.07em; cursor:pointer; transition:all .2s; }
        .rescan-btn:hover { border-color:var(--green-border); color:var(--green); }
        .rescan-btn:disabled { opacity:.4; cursor:not-allowed; }
        .rescan-btn svg { width:14px; height:14px; }

        .t-btn.active { background:var(--green-bg); border-color:var(--green-border); color:var(--green); }

        @media(max-width:500px){
          .chk { grid-template-columns:34px 1fr; padding:10px 12px; }
          .chk-tag { display:none; }
          .chk-detail { font-size:13px; }
          .chk-explain { font-size:10px; }
          .p-val { font-size:14px; }
          .p-val.load { font-size:11px; }
          .score-num { font-size:22px; }
          .sg-val { font-size:16px; }
          .v-title { font-size:14px; }
          .v-sub { font-size:11px; }
          .v-act { font-size:10px; padding:5px 10px; }
          .score-wrap { padding:12px 14px; }
          .verdict { padding:14px 16px; grid-template-columns:38px 1fr; gap:12px; }
          .v-icon { width:38px; height:38px; }
          .v-icon svg { width:17px; height:17px; }
          .chk-icon { width:28px; height:28px; }
          .chk-icon svg { width:13px; height:13px; }
          .sg-item { padding:8px 10px; }
          .p-card { padding:9px 11px; }
          .rescan-btn { padding:9px 20px; font-size:11px; }
        }
      `}</style>

      <div className="bg-primary/10d text-foreground font-mono antialiased">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-7 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-[7px] border border-[var(--green-border)] bg-[var(--green-bg)] flex items-center justify-center text-[var(--green)] brain-pulse" id="brain-wrap" />
              <div>
                <h1 className="font-sans text-[16px] sm:text-[19px] font-extrabold tracking-tight">AI Trading Brain</h1>
                <p className="text-[10px] text-[var(--text3)] tracking-[.1em] uppercase mt-px">Live strategy checklist · Real-time signals</p>
              </div>
            </div>
            <div className="flex items-center gap-[10px]">
              <div className="flex items-center gap-[5px] text-[10px] font-bold tracking-[.08em] uppercase text-[var(--green)] bg-[var(--green-bg)] border border-[var(--green-border)] rounded-full px-[10px] py-[4px]">
                <span className="w-[6px] h-[6px] rounded-full bg-[var(--green)] blink" />Live
              </div>
              <span className="text-[10px] text-[var(--text3)] tracking-[.05em]" id="ts">—</span>
            </div>
          </div>

          <div className="text-center sm:text-left pb-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              className="inline-block px-3 py-2.5 rounded-md border border-blue-500 bg-blue-50 font-mono text-xs font-bold tracking-wider text-blue-700 hover:border-blue-600 hover:text-blue-800 transition-all duration-150 cursor-pointer active:scale-95 w-full sm:w-auto"
              id="btn-BTC"
              onClick={() => selectTicker("BTCUSDT", "BTC")}
            >
              <span id="ic-BTC" /> BTC/USDT
            </button>
            <button
              className="inline-block px-3 py-2.5 rounded-md border border-gray-200 bg-white font-mono text-xs font-bold tracking-wider text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all duration-150 cursor-pointer active:scale-95 w-full sm:w-auto"
              id="btn-ETH"
              onClick={() => selectTicker("ETHUSDT", "ETH")}
            >
              <span id="ic-ETH" /> ETH/USDT
            </button>
            <button
              className="inline-block px-3 py-2.5 rounded-md border border-gray-200 bg-white font-mono text-xs font-bold tracking-wider text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all duration-150 cursor-pointer active:scale-95 w-full sm:w-auto"
              id="btn-SOL"
              onClick={() => selectTicker("SOLUSDT", "SOL")}
            >
              <span id="ic-SOL" /> SOL/USDT
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            <div className="p-card">
              <div className="p-lbl" id="lbl-price" />
              <div className="p-val load" id="pp-price">—</div>
            </div>
            <div className="p-card">
              <div className="p-lbl" id="lbl-change" />
              <div className="p-val load" id="pp-change">—</div>
            </div>
            <div className="p-card">
              <div className="p-lbl" id="lbl-vol" />
              <div className="p-val load" id="pp-vol">—</div>
            </div>
            <div className="p-card">
              <div className="p-lbl" id="lbl-fng" />
              <div className="p-val load" id="pp-fng">—</div>
            </div>
          </div>

          <div className="err-box" id="err-box" />

          <div className="sec-label mb-3">Signal analysis</div>
          <div className="checks" id="checks" />

          <div className="score-wrap flex flex-col gap-3 mt-5 mb-[14px]">
            <div className="score-top">
              <span className="score-lbl" id="score-lbl-el" />
              <span className="score-num" id="score-num">—</span>
            </div>
            <div className="score-track"><div className="score-fill" id="score-fill" /></div>
            <div className="score-grid">
              <div className="sg-item">
                <div className="sg-val" id="sb-bull" style={{ color: "var(--green)" }}>—</div>
                <div className="sg-lbl">Bullish signals</div>
              </div>
              <div className="sg-item">
                <div className="sg-val" id="sb-neut" style={{ color: "var(--text2)" }}>—</div>
                <div className="sg-lbl">Neutral</div>
              </div>
              <div className="sg-item">
                <div className="sg-val" id="sb-bear" style={{ color: "var(--red)" }}>—</div>
                <div className="sg-lbl">Bearish signals</div>
              </div>
            </div>
          </div>

          <div className="verdict" id="verdict">
            <div className="v-icon mt-10" id="v-icon" />
            <div>
              <div className="v-title" id="v-title">Analyzing market…</div>
              <div className="v-sub" id="v-sub">Fetching live data from Binance &amp; Alternative.me</div>
              <div className="v-actions" id="v-actions" />
            </div>
          </div>

          <div className="flex justify-center gap-[10px] flex-wrap my-7">
            <button className="rescan-btn" id="rescan-btn" onClick={runAnalysis}>
              <span id="rescan-ico" /> Rescan market
            </button>
          </div>

          <div className="text-center text-[10px] text-[var(--text3)] tracking-[.06em]">
            Data: <a href="https://binance.com" target="_blank" rel="noopener noreferrer" className="text-[var(--text3)] no-underline hover:text-[var(--text2)]">Binance</a> &nbsp;·&nbsp;
            <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener noreferrer" className="text-[var(--text3)] no-underline hover:text-[var(--text2)]">Alternative.me</a>
            &nbsp;·&nbsp; Not financial advice. Do your own research.
          </div>
        </div>
      </div>

      <SignalDetailsDrawer
        isOpen={drawer.isOpen}
        onClose={() => setDrawer({ isOpen: false, type: "", coinPair: "" })}
        type={drawer.type}
        coinPair={drawer.coinPair}
        data={snapshot}
      />
    </>
  )
}
