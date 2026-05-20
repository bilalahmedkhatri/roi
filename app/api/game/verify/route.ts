import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { serverSeed, clientSeed, nonce } = await req.json();

    if (!serverSeed || !clientSeed || nonce === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: serverSeed, clientSeed, nonce" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    const keyData = encoder.encode(serverSeed);
    const msgData = encoder.encode(`${clientSeed}:${nonce}`);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      { name: "HMAC" },
      cryptoKey,
      msgData
    );

    const hmacHex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const first13 = hmacHex.substring(0, 13);
    const X = BigInt("0x" + first13);

    const DIVISOR = BigInt(33);
    const HOUSE_EDGE_NUMERATOR = BigInt(97);
    const TWO_POW_52 = BigInt(1) << BigInt(52);

    let crashMultiplier: number;

    if (X % DIVISOR === BigInt(0)) {
      crashMultiplier = 1.0;
    } else {
      const numerator = HOUSE_EDGE_NUMERATOR * TWO_POW_52;
      const denominator = BigInt(100) * (TWO_POW_52 - X);
      const floorVal = Number(numerator / denominator);
      crashMultiplier = Math.max(1.0, Math.floor(floorVal) / 100);
    }

    return NextResponse.json({
      verified: true,
      serverSeed,
      clientSeed,
      nonce,
      hmacHex: hmacHex.substring(0, 32) + "...",
      crashMultiplier,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Verification failed", details: String(error) },
      { status: 500 }
    );
  }
}
