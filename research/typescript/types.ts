// file: src/types.ts

/**
 * Represents a single payline as an array of reel positions.
 * e.g., [[0,1], [0,1], [0,1], [0,1], [0,1]] is the middle row.
 */
export type Payline = number[][];

/**
 * Defines the payout multiplier for a given number of matches for a symbol.
 * Format: { [matches: number]: number }
 */
export interface SymbolPayout {
  [matches: number]: number;
}

/**
 * Defines the entire pay table for line wins.
 * Format: { [symbolId: number]: SymbolPayout }
 */
export interface PayTable {
  [symbolId: number]: SymbolPayout;
}

/**
 * Defines the reward for a specific number of scatter symbols.
 */
export interface ScatterPay {
  payout: number;
  freeSpins: number;
}

/**
 * Defines the entire pay table for scatter wins.
 * Format: { [matches: number]: ScatterPay }
 */
export interface ScatterPayTable {
    [matches: number]: ScatterPay;
}

/**
 * Represents a set of reel strips for a specific RTP.
 */
export interface ReelSet {
  id: number;
  rtp: number;
  strips: number[][]; // Array of reel strips, where each inner array is a reel.
}

/**
 * The master data structure holding all configuration for a single game,
 * loaded from the database.
 */
export interface GameDefinition {
  id: number;
  name: string;
  provider: string;
  reelWidth: number;
  reelHeight: number;
  bonusHandlerKey?: string;
  paylines: Payline[];
  payTable: PayTable;
  scatterPayTable: ScatterPayTable;
  reelSets: { [rtp: number]: ReelSet };
}

/**
 * Represents a single winning combination found after a spin.
 */
export interface WinItem {
    pay: number;
    mult: number;
    sym: number;
    num: number;
    line: number;
    xy: number[][];
    free: number;
}
