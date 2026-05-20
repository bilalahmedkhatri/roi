import { v4 as uuid } from "uuid";
import { generateServerSeed, hashSeed, computeCrashMultiplier } from "./provably-fair";
import { ActiveBet, GamePhase, GameState, HistoryEntry } from "./types";

const GROWTH_RATE = 0.06;
const COOLDOWN_MS = 8_000;
const BETTING_MS = 7_000;
const TICK_INTERVAL_MS = 33;

export function multiplierAt(t: number): number {
  return Math.exp(GROWTH_RATE * t);
}

export function timeAt(multiplier: number): number {
  return Math.log(multiplier) / GROWTH_RATE;
}

export class GameEngine {
  private phase: GamePhase = "idle";
  private roundId = "";
  private roundNumber = 0;
  private serverSeed = "";
  private clientSeed = "";
  private nonce = 0;
  private seedHash = "";
  private crashMultiplier = 0;
  private crashTimeMs = 0;
  private startTime = 0;
  private elapsedMs = 0;
  private history: HistoryEntry[] = [];
  private activeBets: Map<string, ActiveBet> = new Map();
  private timer: ReturnType<typeof setInterval> | null = null;
  private phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private broadcast: (event: Record<string, unknown>) => void;
  private getUsersBalance: (userId: string) => { real: number; bonus: number };
  private deductBalance: (userId: string, amount: number, type: "real" | "bonus") => boolean;
  private creditBalance: (userId: string, amount: number) => void;
  public onBetUpdate: ((bet: ActiveBet) => void) | null = null;

  constructor(
    broadcast: (event: Record<string, unknown>) => void,
    getUsersBalance: (userId: string) => { real: number; bonus: number },
    deductBalance: (userId: string, amount: number, type: "real" | "bonus") => boolean,
    creditBalance: (userId: string, amount: number) => void
  ) {
    this.broadcast = broadcast;
    this.getUsersBalance = getUsersBalance;
    this.deductBalance = deductBalance;
    this.creditBalance = creditBalance;
    this.startCooldown();
  }

  getState(): GameState {
    return {
      phase: this.phase,
      roundId: this.roundId,
      roundNumber: this.roundNumber,
      crashMultiplier: this.phase === "crashed" ? this.crashMultiplier : null,
      currentMultiplier: this.phase === "playing" ? multiplierAt(this.elapsedMs / 1000) : 1,
      elapsedMs: this.elapsedMs,
      cooldownEndAt: this.phase === "cooldown" ? Date.now() + COOLDOWN_MS : null,
      bettingEndAt: this.phase === "betting" ? Date.now() + BETTING_MS : null,
      roundStartAt: this.phase === "playing" ? this.startTime : null,
      crashAt: this.phase === "crashed" ? this.startTime + this.crashTimeMs : null,
      seedHash: this.seedHash,
      totalBets: this.activeBets.size,
      totalWagered: Array.from(this.activeBets.values()).reduce((s, b) => s + b.wagerAmount, 0),
    };
  }

  getActiveBets(): ActiveBet[] {
    return Array.from(this.activeBets.values());
  }

  getHistory(): HistoryEntry[] {
    return this.history;
  }

  placeBet(
    userId: string,
    username: string,
    wagerAmount: number,
    balanceType: "real" | "bonus",
    autoCashoutAt: number | null,
    slot: 1 | 2
  ): { success: boolean; error?: string; bet?: ActiveBet } {
    if (this.phase !== "betting") {
      return { success: false, error: "Betting phase is not active" };
    }

    if (wagerAmount <= 0) {
      return { success: false, error: "Invalid wager amount" };
    }

    const balance = this.getUsersBalance(userId);
    const available = balanceType === "real" ? balance.real : balance.bonus;
    if (available < wagerAmount) {
      return { success: false, error: "Insufficient balance" };
    }

    const existingBet = Array.from(this.activeBets.values()).find(
      (b) => b.userId === userId && b.slot === slot
    );
    if (existingBet) {
      return { success: false, error: `Slot ${slot} already has an active bet` };
    }

    if (!this.deductBalance(userId, wagerAmount, balanceType)) {
      return { success: false, error: "Failed to deduct balance" };
    }

    const bet: ActiveBet = {
      id: uuid(),
      userId,
      username,
      roundId: this.roundId,
      slot,
      wagerAmount,
      balanceType,
      autoCashoutAt: autoCashoutAt ?? null,
      status: "placed",
      cashoutMultiplier: null,
      payoutAmount: 0,
      createdAt: Date.now(),
    };

    this.activeBets.set(bet.id, bet);
    this.broadcast({ type: "bet_confirmed", bet });
    if (this.onBetUpdate) this.onBetUpdate(bet);

    return { success: true, bet };
  }

  cashout(betId: string, userId: string): { success: boolean; error?: string } {
    const bet = this.activeBets.get(betId);
    if (!bet || bet.userId !== userId) {
      return { success: false, error: "Bet not found" };
    }
    if (bet.status !== "placed") {
      return { success: false, error: "Bet already settled" };
    }
    if (this.phase !== "playing") {
      return { success: false, error: "Round is not active" };
    }

    const currentMultiplier = multiplierAt(this.elapsedMs / 1000);
    const payout = bet.wagerAmount * currentMultiplier;
    bet.status = "cashed";
    bet.cashoutMultiplier = currentMultiplier;
    bet.payoutAmount = payout;

    this.creditBalance(userId, payout);

    this.broadcast({
      type: "cashout_success",
      betId: bet.id,
      userId: bet.userId,
      username: bet.username,
      cashoutMultiplier: currentMultiplier,
      payoutAmount: payout,
      slot: bet.slot,
    });
    if (this.onBetUpdate) this.onBetUpdate(bet);

    return { success: true };
  }

  private startCooldown() {
    this.phase = "cooldown";
    this.serverSeed = generateServerSeed();
    this.roundNumber++;
    const nextRoundId = `${this.roundNumber}-${this.serverSeed.slice(0, 8)}`;
    this.broadcast({
      type: "cooldown",
      roundId: this.roundId,
      nextRoundId,
      nextRoundNumber: this.roundNumber,
      seedHash: hashSeed(this.serverSeed),
      cooldownEndAt: Date.now() + COOLDOWN_MS,
    });

    this.phaseTimer = setTimeout(() => this.startBetting(), COOLDOWN_MS);
  }

  private startBetting() {
    this.phase = "betting";
    this.roundId = `${this.roundNumber}-${this.serverSeed.slice(0, 8)}`;
    this.broadcast({
      type: "betting",
      roundId: this.roundId,
      roundNumber: this.roundNumber,
      seedHash: hashSeed(this.serverSeed),
      bettingEndAt: Date.now() + BETTING_MS,
    });

    this.phaseTimer = setTimeout(() => this.startRound(), BETTING_MS);
  }

  private startRound() {
    this.clientSeed = uuid().replace(/-/g, "").slice(0, 16);
    this.nonce = this.roundNumber;
    this.crashMultiplier = computeCrashMultiplier(
      this.serverSeed,
      this.clientSeed,
      this.nonce
    );
    this.crashTimeMs = timeAt(this.crashMultiplier) * 1000;
    this.seedHash = hashSeed(this.serverSeed);
    this.startTime = Date.now();
    this.elapsedMs = 0;
    this.phase = "playing";

    this.broadcast({
      type: "start",
      roundId: this.roundId,
      roundNumber: this.roundNumber,
      seedHash: this.seedHash,
      startAt: this.startTime,
    });

    this.timer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  private tick() {
    this.elapsedMs = Date.now() - this.startTime;

    if (this.elapsedMs >= this.crashTimeMs) {
      this.crash();
      return;
    }

    const m = multiplierAt(this.elapsedMs / 1000);

    for (const bet of this.activeBets.values()) {
      if (
        bet.status === "placed" &&
        bet.autoCashoutAt !== null &&
        m >= bet.autoCashoutAt
      ) {
        const payout = bet.wagerAmount * bet.autoCashoutAt;
        bet.status = "cashed";
        bet.cashoutMultiplier = bet.autoCashoutAt;
        bet.payoutAmount = payout;
        this.creditBalance(bet.userId, payout);
        this.broadcast({
          type: "cashout_success",
          betId: bet.id,
          userId: bet.userId,
          username: bet.username,
          cashoutMultiplier: bet.autoCashoutAt,
          payoutAmount: payout,
          slot: bet.slot,
          auto: true,
        });
        if (this.onBetUpdate) this.onBetUpdate(bet);
      }
    }

    this.broadcast({ type: "tick", t: this.elapsedMs, m });
  }

  private crash() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.phase = "crashed";

    for (const bet of this.activeBets.values()) {
      if (bet.status === "placed") {
        bet.status = "lost";
        bet.cashoutMultiplier = null;
        bet.payoutAmount = 0;
        if (this.onBetUpdate) this.onBetUpdate(bet);
      }
    }

    this.broadcast({
      type: "crash",
      roundId: this.roundId,
      crashMultiplier: this.crashMultiplier,
      crashAt: this.startTime + this.crashTimeMs,
      seedHash: this.seedHash,
      serverSeed: this.serverSeed,
      clientSeed: this.clientSeed,
      nonce: this.nonce,
    });

    this.history.unshift({
      roundNumber: this.roundNumber,
      crashMultiplier: this.crashMultiplier,
      seedHash: this.seedHash,
    });
    if (this.history.length > 50) this.history.pop();

    this.phaseTimer = setTimeout(() => {
      this.activeBets.clear();
      this.startCooldown();
    }, 3000);
  }
}
