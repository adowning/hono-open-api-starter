// file: src/logic/StandardGame.ts

import { GameDefinition, ReelSet, WinItem } from "../types";

const WILD_SYMBOL_ID = 1;
const SCATTER_SYMBOL_ID = 2;

/**
 * Defines the interface for swappable bonus logic modules.
 */
export interface IBonusHandler {
    applyBonus(game: StandardGame, wins: WinItem[]): void;
}

export class StandardGame {
    // Game configuration
    public readonly definition: GameDefinition;
    private activeReelSet: ReelSet;
    private bonusHandler?: IBonusHandler;

    // Game state
    public screen: number[][]; // The 5x3 grid of symbols
    public betPerLine: number;
    public selectedLines: number;
    public freeSpinsRemaining: number;
    public freeSpinMultiplier: number;

    constructor(definition: GameDefinition, rtp: number, bonusHandler?: IBonusHandler, bet: number = 1, sel: number = 20) {
        this.definition = definition;
        this.betPerLine = bet;
        this.selectedLines = sel > definition.paylines.length ? definition.paylines.length : sel;
        this.freeSpinsRemaining = 0;
        this.freeSpinMultiplier = 1;
        this.bonusHandler = bonusHandler;

        const availableRtps = Object.keys(definition.reelSets).map(parseFloat);
        const closestRtp = availableRtps.reduce((prev, curr) =>
            Math.abs(curr - rtp) < Math.abs(prev - rtp) ? curr : prev
        );
        this.activeReelSet = definition.reelSets[closestRtp];

        this.screen = Array(definition.reelWidth).fill(null).map(() => Array(definition.reelHeight).fill(0));
    }

    public spin(): void {
        const newScreen: number[][] = [];
        for (let i = 0; i < this.definition.reelWidth; i++) {
            const strip = this.activeReelSet.strips[i];
            if (!strip || strip.length === 0) {
                throw new Error(`Reel strip for index ${i} is empty or missing.`);
            }
            const stopPosition = Math.floor(Math.random() * strip.length);
            const reel: number[] = [];
            for (let j = 0; j < this.definition.reelHeight; j++) {
                reel.push(strip[(stopPosition + j) % strip.length]);
            }
            newScreen.push(reel);
        }
        this.screen = newScreen;
    }

    public calculateWins(): WinItem[] {
        const wins: WinItem[] = [];
        this.scanLined(wins);
        this.scanScatters(wins);

        if (this.bonusHandler) {
            this.bonusHandler.applyBonus(this, wins);
        }
        
        return wins;
    }

    private scanLined(wins: WinItem[]): void {
        const activePaylines = this.definition.paylines.slice(0, this.selectedLines);

        for (let i = 0; i < activePaylines.length; i++) {
            const line = activePaylines[i];
            let wildMultiplier = 1;
            let firstSymbol = 0;
            let matches = 0;
            const winPositions: number[][] = [];

            for (let reelIdx = 0; reelIdx < this.definition.reelWidth; reelIdx++) {
                const rowIdx = line[reelIdx][1];
                const symbol = this.screen[reelIdx][rowIdx];

                if (reelIdx === 0) {
                    if (symbol !== WILD_SYMBOL_ID) {
                        firstSymbol = symbol;
                    }
                    matches = 1;
                    winPositions.push([reelIdx, rowIdx]);
                } else {
                    if (firstSymbol === 0 && symbol !== WILD_SYMBOL_ID) {
                        firstSymbol = symbol;
                    }

                    if (symbol === firstSymbol || symbol === WILD_SYMBOL_ID) {
                        matches++;
                        winPositions.push([reelIdx, rowIdx]);
                    } else {
                        break;
                    }
                }
                if (this.definition.name === 'Piggy Riches' && symbol === WILD_SYMBOL_ID) {
                    wildMultiplier = 3;
                }
            }

            if (firstSymbol > SCATTER_SYMBOL_ID && this.definition.payTable[firstSymbol]?.[matches]) {
                const payout = this.definition.payTable[firstSymbol][matches];
                if (payout > 0) {
                    wins.push({
                        pay: this.betPerLine * payout,
                        mult: wildMultiplier * this.freeSpinMultiplier,
                        sym: firstSymbol,
                        num: matches,
                        line: i + 1,
                        xy: winPositions,
                        free: 0,
                    });
                }
            }
        }
    }

    private scanScatters(wins: WinItem[]): void {
        const positions: number[][] = [];
        let count = 0;
        for (let r = 0; r < this.definition.reelWidth; r++) {
            for (let c = 0; c < this.definition.reelHeight; c++) {
                if (this.screen[r][c] === SCATTER_SYMBOL_ID) {
                    count++;
                    positions.push([r, c]);
                }
            }
        }

        if (this.definition.scatterPayTable[count]) {
            const scatterInfo = this.definition.scatterPayTable[count];
            const totalBet = this.betPerLine * this.selectedLines;
            wins.push({
                pay: totalBet * scatterInfo.payout,
                mult: 1,
                sym: SCATTER_SYMBOL_ID,
                num: count,
                line: 0,
                xy: positions,
                free: scatterInfo.freeSpins,
            });
        }
    }
}