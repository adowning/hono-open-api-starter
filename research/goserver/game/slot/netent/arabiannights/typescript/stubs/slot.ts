// Stubs for github.com/slotopol/server/game/slot

export type Reels5x = number[][];

export class Stat {
    Count(): number { return 0; }
    LineRTP(cost: number): number { return 0; }
    ScatRTP(cost: number): number { return 0; }
    FreeCount(): number { return 0; }
    FreeCountU(): number { return 0; }
    FreeHits(): number { return 0; }
}

export type Pos = number;
export type Sym = number;

export interface WinItem {
    Pay: number;
    Mult: number;
    Sym: Sym;
    Num: Pos;
    Line?: number;
    XY?: Pos[];
    Free?: number;
}

export type Wins = WinItem[];

export class Screen5x3 {
    LY(x: Pos, line: any): Sym { return 0; }
    ScatNum(scat: Sym): number { return 0; }
    ScatPos(scat: Sym): Pos[] { return []; }
    ReelSpin(reels: Reels5x): void {}
}

export class Slotx {
    Sel: number = 0;
    Bet: number = 0;
    FSR: number = 0; // Free Spin Round

    Cost(): [number, number] { return [0, 0]; }
    SetSelNum(sel: number, max: number): error | null { return null; }
}

export interface SlotGame {
    Clone(): SlotGame;
    Scanner(wins: Wins): error | null;
    Spin(mrtp: number): void;
    SetSel(sel: number): error | null;
}

export const BetLinesNetEnt5x3: Pos[][] = [];

export function ReadObj<T>(data: any): T { return {} as T; }
export function ReadMap<T>(data: any): { [key: string]: T } { return {}; }
export function FindClosest<T>(m: { [key: string]: T }, key: number): [T, number] { return [{} as T, 0]; }
export function ScanReels5x(ctx: any, s: Stat, g: SlotGame, reels: Reels5x, calc: (w: any) => number): number { return 0; }
