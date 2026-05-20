import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { GameEngine } from "./engine";
import { ActiveBet, ClientMessage } from "./types";

const PORT = parseInt(process.env.PORT || "3001", 10);
const WS_PATH = process.env.WS_PATH || "/ws";

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Crash Game Server");
});

const wss = new WebSocketServer({ server: httpServer, path: WS_PATH });

const userClients = new Map<string, Set<WebSocket>>();
const clientUser = new Map<WebSocket, string>();
const clientName = new Map<WebSocket, string>();
const userBalances = new Map<string, { real: number; bonus: number }>();
const suspendedUsers = new Set<string>();

function getOrCreateBalance(userId: string): { real: number; bonus: number } {
  if (!userBalances.has(userId)) {
    userBalances.set(userId, { real: 10000, bonus: 0 });
  }
  return userBalances.get(userId)!;
}

function broadcast(event: Record<string, unknown>) {
  const msg = JSON.stringify(event);
  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

function sendTo(ws: WebSocket, event: Record<string, unknown>) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

const engine = new GameEngine(
  broadcast,
  (userId: string) => getOrCreateBalance(userId),
  (userId: string, amount: number, type: "real" | "bonus"): boolean => {
    const balance = getOrCreateBalance(userId);
    const key = type === "real" ? "real" : "bonus";
    if (balance[key] < amount) return false;
    balance[key] -= amount;
    return true;
  },
  (userId: string, amount: number) => {
    const balance = getOrCreateBalance(userId);
    balance.real += amount;
  }
);

wss.on("connection", (ws: WebSocket, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const userId = url.searchParams.get("userId") || `guest-${Math.random().toString(36).slice(2, 8)}`;
  const username = url.searchParams.get("username") || `Player_${userId.slice(0, 6)}`;

  clientUser.set(ws, userId);
  clientName.set(ws, username);
  if (!userClients.has(userId)) {
    userClients.set(userId, new Set());
  }
  userClients.get(userId)!.add(ws);

  getOrCreateBalance(userId);

  sendTo(ws, {
    type: "game_state",
    state: engine.getState(),
    activeBets: engine.getActiveBets(),
    history: engine.getHistory(),
    balance: getOrCreateBalance(userId),
  });

  ws.on("message", (data) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (suspendedUsers.has(userId)) {
      sendTo(ws, { type: "error", message: "Account suspended" });
      return;
    }

    switch (msg.type) {
      case "place_bet": {
        const { wagerAmount, balanceType, autoCashoutAt, slot } = msg as any;
        const result = engine.placeBet(
          userId,
          username,
          wagerAmount,
          balanceType || "real",
          autoCashoutAt ?? null,
          slot || 1
        );
        sendTo(ws, {
          type: result.success ? "bet_placed" : "bet_error",
          ...result,
          slot,
        });
        if (result.success) {
          sendTo(ws, { type: "balance_update", balance: getOrCreateBalance(userId) });
        }
        break;
      }

      case "cashout": {
        const { betId } = msg as any;
        const result = engine.cashout(betId, userId);
        sendTo(ws, {
          type: result.success ? "cashout_done" : "cashout_error",
          ...result,
        });
        if (result.success) {
          sendTo(ws, { type: "balance_update", balance: getOrCreateBalance(userId) });
        }
        break;
      }

      default:
        sendTo(ws, { type: "error", message: `Unknown message type: ${msg.type}` });
    }
  });

  ws.on("close", () => {
    const clients = userClients.get(userId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) userClients.delete(userId);
    }
    clientUser.delete(ws);
    clientName.delete(ws);
  });

  ws.on("error", () => {});
});

httpServer.listen(PORT, () => {
  console.log(`Crash Game Server running on port ${PORT}${WS_PATH}`);
});
