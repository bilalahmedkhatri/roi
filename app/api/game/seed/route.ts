import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    algorithm: "HMAC-SHA512",
    houseEdge: "3%",
    formula:
      "M = max(1.00, floor(97 * 2^52 / (100 * (2^52 - X))) / 100)",
    description:
      "Crash point is determined before the round starts using HMAC-SHA512(serverSeed, clientSeed:nonce). First 13 hex chars become integer X. If X % 33 == 0, crash at 1.00x. Otherwise use the formula above.",
  });
}
