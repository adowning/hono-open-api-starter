export function toDecimal(value: number | null): number | null {
  return value === null ? null : value;
}

export function toNumber(value: number | null): number | null {
  return value === null ? null : value;
}

export function decimalToNumber(value: number | null): number | null {
  if (value === null)
    return null;
  return value;
}

export function numberToDecimal(value: number | null): number | null {
  if (value === null)
    return null;
  return value;
}

/**
 * Checks if the given value is an instance of Decimal.
 * @param rtp The value to check.
 * @returns True if the value is a Decimal instance, false otherwise.
 */
export function isDecimal(rtp: unknown): rtp is number {
  return typeof rtp === "number";
}

export const coinsToDollars = (coins: number): number => coins / 100;
export const dollarsToCoins = (dollars: number): number => Math.round(dollars * 100);
export const toCents = (amount: number): number => Math.round(amount * 100);
export const fromCents = (amountInCents: number): number => amountInCents / 100;
