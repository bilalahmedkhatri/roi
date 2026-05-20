async function hmacSHA512(key: string, data: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(key);
  const dataBytes = new TextEncoder().encode(data);

  const algo = { name: "HMAC", hash: "SHA-512" };

  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, algo, false, ["sign"]);
  const signature = await crypto.subtle.sign(algo, cryptoKey, dataBytes);

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToDecimal(hex: string): bigint {
  return BigInt("0x" + hex);
}

const DIVISOR = BigInt(33);
const HOUSE_EDGE_NUMERATOR = BigInt(97);
const TWO_POW_52 = BigInt(1) << BigInt(52);

export function generateServerSeed(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashSeed(seed: string): Promise<string> {
  const bytes = new TextEncoder().encode(seed);
  const hashBuf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeCrashMultiplier(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<number> {
  const hmacHex = await hmacSHA512(serverSeed, `${clientSeed}:${nonce}`);
  const first13 = hmacHex.substring(0, 13);
  const X = hexToDecimal(first13);

  if (X % DIVISOR === BigInt(0)) {
    return 1.00;
  }

  const numerator = HOUSE_EDGE_NUMERATOR * TWO_POW_52;
  const denominator = BigInt(100) * (TWO_POW_52 - X);
  const floorVal = Number(numerator / denominator);
  const crash = Math.max(1.00, Math.floor(floorVal) / 100);

  return crash;
}
