import {
    SlotGame,
    Wins,
    Pos,
    Sym,
    FindClosest,
    Reels5x,
} from './stubs/slot';
import { ReelsBon } from './arabiannights-bon';
import { ReelsMap } from './arabiannights-reel';

// Lined payment.
const LinePay: number[][] = [
    [0, 2, 25, 125, 2000],     //  1 knife
    [0, 2, 25, 125, 1000],     //  2 sneakers
    [0, 2, 10, 75, 500],       //  3 tent
    [0, 2, 10, 75, 300],       //  4 drum
    [0, 0, 5, 30, 150],        //  5 camel
    [0, 0, 5, 30, 150],        //  6 king
    [0, 0, 5, 20, 125],        //  7 queen
    [0, 0, 5, 20, 125],        //  8 jack
    [0, 0, 3, 15, 75],         //  9 ten
    [0, 0, 3, 15, 75],         // 10 nine
    [0, 10, 200, 2500, 10000], // 11 wild
    [],                        // 12 scatter
];

// Scatters payment.
const ScatPay: number[] = [0, 2, 5, 20, 500]; // 12 scatter

// Scatter freespins table
const ScatFreespin: number[] = [0, 0, 15, 15, 15]; // 12 scatter

// Bet lines. In the original Go code, this was the first 10 lines from a standard NetEnt set.
const BetLines: Pos[][] = [
    [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2], [2, 2, 1, 0, 0], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [1, 0, 1, 2, 1]
].map(line => line.map(y => y)); // Ensure we have mutable copies

const wild: Sym = 11;
const scat: Sym = 12;

export class Game implements SlotGame {
    Sel: number;
    Bet: number;
    FSR: number; // Free Spin Round
    screen: Sym[][];

    constructor() {
        this.Sel = BetLines.length;
        this.Bet = 1;
        this.FSR = 0;
        this.screen = Array(5).fill(0).map(() => Array(3).fill(0));
    }

    Clone(): SlotGame {
        const clone = new Game();
        clone.Sel = this.Sel;
        clone.Bet = this.Bet;
        clone.FSR = this.FSR;
        clone.screen = this.screen.map(col => [...col]);
        return clone;
    }

    SetSel(sel: number): Error | null {
        if (sel > 0 && sel <= BetLines.length) {
            this.Sel = sel;
            return null;
        }
        return new Error("invalid selection");
    }

    // Get symbol on screen at reel x, row y (0-indexed)
    private getSym(x: number, y: number): Sym {
        return this.screen[x][y];
    }

    // Get symbol for a specific position on a payline
    LY(x: Pos, line: Pos[]): Sym {
        // x is 1-based in Go code, line positions are 0-based
        return this.getSym(x - 1, line[x - 1]);
    }

    ScatNum(scatSym: Sym): number {
        return this.screen.flat().filter(s => s === scatSym).length;
    }

    ScatPos(scatSym: Sym): Pos[] {
        const positions: Pos[] = [];
        this.screen.forEach((col, x) => {
            col.forEach((sym, y) => {
                if (sym === scatSym) {
                    positions.push(x, y);
                }
            });
        });
        return positions;
    }

    ReelSpin(reels: Reels5x): void {
        for (let i = 0; i < 5; i++) {
            const reel = reels[i];
            const start = Math.floor(Math.random() * reel.length);
            this.screen[i][0] = reel[start];
            this.screen[i][1] = reel[(start + 1) % reel.length];
            this.screen[i][2] = reel[(start + 2) % reel.length];
        }
    }

    Spin(mrtp: number): void {
        if (this.FSR === 0) {
            const [reels, _] = FindClosest(ReelsMap, mrtp);
            this.ReelSpin(reels);
        } else {
            this.ReelSpin(ReelsBon);
        }
    }

    Scanner(wins: Wins): null {
        this.ScanLined(wins);
        this.ScanScatters(wins);
        return null;
    }

    ScanLined(wins: Wins): void {
        BetLines.slice(0, this.Sel).forEach((line, li) => {
            let mw: number = 1; // mult wild
            let numw: Pos = 0;
            let numl: Pos = 5;
            let syml: Sym = 0;

            for (let x: Pos = 1; x <= 5; x++) {
                const sx = this.LY(x, line);
                if (sx === wild) {
                    if (syml === 0) {
                        numw = x;
                    }
                    mw = 2;
                } else if (syml === 0 && sx !== scat) {
                    syml = sx;
                } else if (sx !== syml) {
                    numl = x - 1;
                    break;
                }
            }

            const payw = (numw >= 2) ? LinePay[wild - 1][numw - 1] : 0;
            const payl = (numl >= 2 && syml > 0) ? LinePay[syml - 1][numl - 1] : 0;

            let mm = (this.FSR > 0) ? 3 : 1;

            if (payl * mw > payw) {
                wins.push({
                    Pay: this.Bet * payl,
                    Mult: mw * mm,
                    Sym: syml,
                    Num: numl,
                    Line: li + 1,
                    XY: line.slice(0, numl),
                });
            } else if (payw > 0) {
                wins.push({
                    Pay: this.Bet * payw,
                    Mult: mm,
                    Sym: wild,
                    Num: numw,
                    Line: li + 1,
                    XY: line.slice(0, numw),
                });
            }
        });
    }

    ScanScatters(wins: Wins): void {
        const count = this.ScatNum(scat);
        if (count >= 2) {
            const mm = (this.FSR > 0) ? 3 : 1;
            const pay = ScatPay[count - 1];
            const fs = ScatFreespin[count - 1];
            wins.push({
                Pay: this.Bet * this.Sel * pay,
                Mult: mm,
                Sym: scat,
                Num: count,
                XY: this.ScatPos(scat),
                Free: fs,
            });
        }
    }
}

export function NewGame(): Game {
    return new Game();
}
