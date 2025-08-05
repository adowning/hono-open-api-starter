// This is a stub for the game package.

import { Cfg } from './config';

// Base interface for all games
export interface Gamble {
    spin(mrtp: number): void;
}

// Interface for Slot games
export interface SlotGame extends Gamble {
    getBet(): number;
    setBet(bet: number): Error | null;
    getSel(): number;
    setSel(sel: number): Error | null;
    setMode(n: number): Error | null;
    free(): boolean;
    cost(): [number, boolean];
    prepare(): void;
    scanner(wins: any): Error | null;
    spawn(wins: any, fund: number, mrtp: number): void;
    apply(wins: any): void;
    getGain(): number;
    setGain(gain: number): Error | null;
}

// Interface for Keno games
export interface KenoGame extends Gamble {
    getBet(): number;
    setBet(bet: number): Error | null;
    getSel(): any; // In Go, this is a Bitset
    setSel(sel: any): Error | null;
    scanner(wins: any): Error | null;
}

// Mock implementation of a SlotGame
class MockSlotGame implements SlotGame {
    private bet: number = 1;
    private sel: number = 1;
    private gain: number = 0;

    getBet = () => this.bet;
    setBet = (bet: number) => { this.bet = bet; return null; };
    getSel = () => this.sel;
    setSel = (sel: number) => { this.sel = sel; return null; };
    setMode = (n: number) => null;
    free = () => false;
    cost = (): [number, boolean] => [this.bet * this.sel, false];
    prepare = () => {};
    spin = (mrtp: number) => {};
    scanner = (wins: any) => null;
    spawn = (wins: any, fund: number, mrtp: number) => {};
    apply = (wins: any) => {};
    getGain = () => this.gain;
    setGain = (gain: number) => { this.gain = gain; return null; };
}

// Mock implementation of a KenoGame
class MockKenoGame implements KenoGame {
    private bet: number = 1;
    private sel: any = {};

    getBet = () => this.bet;
    setBet = (bet: number) => { this.bet = bet; return null; };
    getSel = () => this.sel;
    setSel = (sel: any) => { this.sel = sel; return null; };
    spin = (mrtp: number) => {};
    scanner = (wins: any) => null;
}


// Mock GameFactory
export const GameFactory: { [key: string]: () => Gamble } = {
    "novomatic/dolphinspearl": () => new MockSlotGame(),
    "novomatic/sizzlinghot": () => new MockSlotGame(),
    "keno/americankeno": () => new MockKenoGame(),
};

// Mock GameInfo
export interface GameInfo {
    Name: string;
    Prov: string;
    AlgDescr: any;
    FindClosest(mrtp: number): number;
}

export const InfoMap: { [key: string]: GameInfo } = {
    "novomatic/dolphinspearl": {
        Name: "Dolphins Pearl",
        Prov: "Novomatic",
        AlgDescr: {},
        FindClosest: (mrtp: number) => mrtp,
    },
};

// Mock Filter
export type Filter = (gi: GameInfo) => boolean;
export const GetFilter = (key: string): Filter | null => (gi: GameInfo) => true;
export const Passes = (gi: GameInfo, finclist: Filter[], fexclist: Filter[]) => true;

// Mock AlgList
export const AlgList: string[] = ["Novomatic", "Keno"];
