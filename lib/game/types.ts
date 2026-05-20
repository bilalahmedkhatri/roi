export type GamePhase = "idle" | "cooldown" | "betting" | "playing" | "crashed";

export type BetStatus = "placed" | "cashed" | "lost";

export type BalanceType = "real" | "bonus";

export interface CrashPointResult {
  crashMultiplier: number;
  serverSeed: string;
  seedHash: string;
  clientSeed: string;
  nonce: number;
}

export interface GameState {
  phase: GamePhase;
  roundId: string;
  roundNumber: number;
  crashMultiplier: number | null;
  currentMultiplier: number;
  elapsedMs: number;
  cooldownEndAt: number | null;
  bettingEndAt: number | null;
  roundStartAt: number | null;
  crashAt: number | null;
  seedHash: string | null;
  totalBets: number;
  totalWagered: number;
}

export interface BetPlaced {
  id: string;
  userId: string;
  username: string;
  roundId: string;
  slot: 1 | 2;
  wagerAmount: number;
  balanceType: BalanceType;
  autoCashoutAt: number | null;
  status: BetStatus;
  cashoutMultiplier: number | null;
  payoutAmount: number;
  createdAt: number;
}

export interface GameTickEvent {
  type: "tick";
  t: number;
  m: number;
}

export interface GameStartEvent {
  type: "start";
  roundId: string;
  roundNumber: number;
  seedHash: string;
  startAt: number;
}

export interface GameCrashEvent {
  type: "crash";
  roundId: string;
  crashMultiplier: number;
  crashAt: number;
}

export interface GameCooldownEvent {
  type: "cooldown";
  roundId: string;
  nextRoundId: string;
  nextRoundNumber: number;
  seedHash: string;
  cooldownEndAt: number;
}

export interface GameBettingEvent {
  type: "betting";
  roundId: string;
  roundNumber: number;
  seedHash: string;
  bettingEndAt: number;
}

export interface BetConfirmEvent {
  type: "bet_confirmed";
  bet: BetPlaced;
}

export interface CashoutSuccessEvent {
  type: "cashout_success";
  betId: string;
  userId: string;
  username: string;
  cashoutMultiplier: number;
  payoutAmount: number;
  slot: 1 | 2;
}

export interface GameStateEvent {
  type: "game_state";
  state: GameState;
  activeBets: BetPlaced[];
}

export interface GameBalanceEvent {
  type: "balance_update";
  balance: { real: number; bonus: number };
}

export interface GameErrorEvent {
  type: "error" | "bet_error" | "cashout_error";
  message: string;
}

export interface GameBetPlacedEvent {
  type: "bet_placed" | "cashout_done";
  success: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GameServerEvent = any;

export interface ClientPlaceBet {
  type: "place_bet";
  wagerAmount: number;
  balanceType: BalanceType;
  autoCashoutAt: number | null;
  slot: 1 | 2;
}

export interface ClientCashout {
  type: "cashout";
  betId: string;
  slot: 1 | 2;
}

export type ClientMessage = ClientPlaceBet | ClientCashout;

export interface HistoryEntry {
  roundNumber: number;
  crashMultiplier: number;
  seedHash: string;
}
