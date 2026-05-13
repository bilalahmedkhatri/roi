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

export function formatCryptoRates(): string {
  return "1 BTC ≈ $67,542 | 1 ETH ≈ $3,457 | 1 SOL ≈ $142.56";
}

const PKR_RATE = 278.5;

export function convertToPKR(usdAmount: number): number {
  return usdAmount * PKR_RATE;
}
