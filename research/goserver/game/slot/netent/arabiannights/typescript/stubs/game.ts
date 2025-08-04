// Stubs for github.com/slotopol/server/game

import { SlotGame } from './slot';

export type Gamble = SlotGame;

export interface GameAlias {
    Prov: string;
    Name: string;
    Date: Date;
}

export interface AlgDescr {
    GT: number;
    GP: number;
    SX: number;
    SY: number;
    SN: number;
    LN: number;
    BN: number;
    RTP: number[];
}

export interface AlgInfo {
    Aliases: GameAlias[];
    AlgDescr: AlgDescr;
    SetupFactory(factory: () => Gamble, calc: (ctx: any, mrtp: number) => number): void;
}

export function Date(year: number, month: number, day: number): Date {
    return new global.Date(year, month - 1, day);
}

export const GTslot = 1;
export const GPlpay = 1 << 0;
export const GPlsel = 1 << 1;
export const GPretrig = 1 << 2;
export const GPfgreel = 1 << 3;
export const GPfgmult = 1 << 4;
export const GPscat = 1 << 5;
export const GPwild = 1 << 6;
export const GPwmult = 1 << 7;

export function MakeRtpList(reelsMap: any): number[] {
    return Object.keys(reelsMap).map(Number);
}
