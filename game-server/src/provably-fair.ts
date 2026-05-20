import { createHmac, createHash, randomBytes } from "crypto";

const DIVISOR = BigInt(33);
const HOUSE_EDGE_NUMERATOR = BigInt(97);
const TWO_POW_52 = BigInt(1) << BigInt(52);

export function generateServerSeed(): string {
  return randomBytes(32).toString("hex");
}

export function hashSeed(seed: string): string {
  return createHash("sha256").update(seed).digest("hex");
}

export function computeCrashMultiplier(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number {
  const hmacHex = createHmac("sha512", serverSeed)
    .update(`${clientSeed}:${nonce}`)
    .digest("hex");

  const first13 = hmacHex.substring(0, 13);
  const X = BigInt("0x" + first13);

  if (X % DIVISOR === BigInt(0)) {
    return 1.0;
  }

  const numerator = HOUSE_EDGE_NUMERATOR * TWO_POW_52;
  const denominator = BigInt(100) * (TWO_POW_52 - X);
  const floorVal = Number(numerator / denominator);
  const crash = Math.max(1.0, Math.floor(floorVal) / 100);

  return crash;
}
