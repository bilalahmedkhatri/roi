"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  playRoundStart,
  playCrash,
  playCashout,
  playBetPlaced,
  playCooldown,
} from "@/lib/game/sounds";
import type {
  GameState,
  BetPlaced,
  HistoryEntry,
  GameServerEvent,
  ClientMessage,
} from "@/lib/game/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws";

interface Balance {
  real: number;
  bonus: number;
}

interface GameContextValue {
  connected: boolean;
  state: GameState | null;
  activeBets: BetPlaced[];
  history: HistoryEntry[];
  balance: Balance | null;
  clientSeed: string | null;
  send: (msg: ClientMessage) => void;
  roundResult: {
    crashMultiplier: number;
    serverSeed: string;
    clientSeed: string;
    nonce: number;
  } | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

export function GameProvider({
  children,
  userId,
  username,
}: {
  children: ReactNode;
  userId?: string;
  username?: string;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<GameState | null>(null);
  const [activeBets, setActiveBets] = useState<BetPlaced[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [clientSeed, setClientSeed] = useState<string | null>(null);
  const [roundResult, setRoundResult] = useState<GameContextValue["roundResult"]>(null);

  const connect = useCallback(() => {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (username) params.set("username", username);

    const ws = new WebSocket(`${WS_URL}?${params.toString()}`);

    ws.onopen = () => {
      setConnected(true);
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = undefined;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: GameServerEvent = JSON.parse(event.data);
        handleMessage(data);
      } catch { /* ignore malformed */ }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      reconnectRef.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [userId, username]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  function handleMessage(data: GameServerEvent) {
    switch (data.type) {
      case "game_state": {
        const d = data as any;
        setState(d.state);
        setActiveBets(d.activeBets || []);
        setHistory(d.history || []);
        setBalance(d.balance || null);
        break;
      }
      case "tick": {
        const d = data as any;
        setState((prev) =>
          prev
            ? {
                ...prev,
                phase: "playing",
                currentMultiplier: d.m,
                elapsedMs: d.t,
              }
            : prev
        );
        setRoundResult(null);
        break;
      }
      case "start": {
        playRoundStart();
        const d = data as any;
        setState((prev) =>
          prev
            ? {
                ...prev,
                phase: "playing",
                roundId: d.roundId,
                currentMultiplier: 1,
                elapsedMs: 0,
                roundStartAt: d.startAt,
                crashMultiplier: null,
                crashAt: null,
                seedHash: d.seedHash,
              }
            : prev
        );
        setClientSeed(null);
        setRoundResult(null);
        break;
      }
      case "cooldown": {
        playCooldown();
        const d = data as any;
        setState((prev) =>
          prev
            ? {
                ...prev,
                phase: "cooldown",
                currentMultiplier: 1,
                elapsedMs: 0,
                crashMultiplier: null,
                cooldownEndAt: d.cooldownEndAt,
                seedHash: d.seedHash,
              }
            : prev
        );
        break;
      }
      case "betting": {
        const d = data as any;
        setState((prev) =>
          prev
            ? {
                ...prev,
                phase: "betting",
                roundId: d.roundId,
                bettingEndAt: d.bettingEndAt,
                seedHash: d.seedHash,
              }
            : prev
        );
        setActiveBets([]);
        break;
      }
      case "crash": {
        playCrash();
        const d = data as any;
        setState((prev) =>
          prev
            ? {
                ...prev,
                phase: "crashed",
                crashMultiplier: d.crashMultiplier,
                crashAt: d.crashAt,
              }
            : prev
        );
        setRoundResult({
          crashMultiplier: d.crashMultiplier,
          serverSeed: d.serverSeed,
          clientSeed: d.clientSeed,
          nonce: d.nonce,
        });
        setClientSeed(d.clientSeed);
        break;
      }
      case "bet_confirmed": {
        playBetPlaced();
        const d = data as any;
        setActiveBets((prev) => [...prev, d.bet]);
        break;
      }
      case "cashout_success": {
        playCashout();
        const d = data as any;
        setActiveBets((prev) =>
          prev.map((b) =>
            b.id === d.betId
              ? {
                  ...b,
                  status: "cashed",
                  cashoutMultiplier: d.cashoutMultiplier,
                  payoutAmount: d.payoutAmount,
                }
              : b
          )
        );
        break;
      }
      case "balance_update": {
        const d = data as any;
        setBalance(d.balance);
        break;
      }
    }
  }

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        connected,
        state,
        activeBets,
        history,
        balance,
        clientSeed,
        send,
        roundResult,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
