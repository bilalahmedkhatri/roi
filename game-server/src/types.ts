export type GamePhase = "idle" | "cooldown" | "betting" | "playing" | "crashed";

export type BetStatus = "placed" | "cashed" | "lost";
export type BalanceType = "real" | "bonus";

export interface ActiveBet {
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

export interface GameServerEvent {
  type: string;
  [key: string]: unknown;
}

export interface ClientMessage {
  type: string;
  [key: string]: unknown;
}

export interface HistoryEntry {
  roundNumber: number;
  crashMultiplier: number;
  seedHash: string;
}
