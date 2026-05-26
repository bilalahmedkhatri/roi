export function detectPakistan(): boolean {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Karachi";
  } catch {
    return false;
  }
}

export function formatBalance(amount: number, isPK: boolean): string {
  if (isPK) {
    return `Rs. ${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
}

export function formatAmount(amount: number, isPK: boolean): string {
  if (isPK) {
    return `Rs. ${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function formatAmountWithSign(amount: number, isPK: boolean, prefix = "+"): string {
  const formatted = isPK ? `Rs. ${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
  return `${prefix}${formatted}`;
}

export const CRYPTO_RATES: Record<string, number> = {
  BTC: 76616.44,
  ETH: 2600.00,
  USDT: 1.00,
  SOL: 120.00,
};

export const USD_TO_PKR = 278.50;

export function formatCryptoRates(): string {
  return `1 BTC ≈ $${CRYPTO_RATES.BTC.toLocaleString()} | 1 ETH ≈ $${CRYPTO_RATES.ETH.toLocaleString()} | 1 SOL ≈ $${CRYPTO_RATES.SOL.toLocaleString()}`;
}

export function convertToPKR(usdAmount: number): number {
  return usdAmount * USD_TO_PKR;
}
