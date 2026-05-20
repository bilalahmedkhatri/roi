const GROWTH_RATE = 0.06;

export function multiplierAt(t: number): number {
  return Math.exp(GROWTH_RATE * t);
}

export function timeAt(multiplier: number): number {
  return Math.log(multiplier) / GROWTH_RATE;
}

export function tickIntervalMs(): number {
  return 33;
}

export const HOUSE_EDGE_PERCENT = 3;
