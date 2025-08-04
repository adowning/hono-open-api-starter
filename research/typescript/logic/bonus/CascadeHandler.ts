// file: src/logic/bonus/CascadeHandler.ts

import { IBonusHandler, StandardGame } from "../StandardGame";
import { WinItem } from "../../types";

/**
 * Implements the "Cascade" or "Avalanche" feature, famously used in Gonzo's Quest.
 */
export class CascadeHandler implements IBonusHandler {
    
    // In Gonzo's Quest, the multiplier increases with each consecutive cascade.
    private cascadeMultipliers = [1, 2, 3, 5]; // 1x for initial, 2x for 1st cascade, etc.
    private freefallMultipliers = [3, 6, 9, 15];
    private cascadeCount = 0;

    public applyBonus(game: StandardGame, wins: WinItem[]): void {
        if (wins.length === 0) {
            // No wins, so reset the cascade count for the next spin.
            this.cascadeCount = 0;
            return;
        }

        // Apply the cascade multiplier to all wins
        const currentMultipliers = game.freeSpinsRemaining > 0 ? this.freefallMultipliers : this.cascadeMultipliers;
        const multiplier = currentMultipliers[Math.min(this.cascadeCount, currentMultipliers.length - 1)];
        
        for (const win of wins) {
            win.mult *= multiplier;
        }

        // --- This is where the cascade logic would happen ---
        // For this simulation, we will just log that it *would* happen.
        // A full implementation is complex and requires a game loop.
        
        console.log(`CASCADE: Applying x${multiplier} multiplier. Wins found: ${wins.length}.`);
        console.log("CASCADE: In a real game, winning symbols would be removed and new ones would fall down.");

        // Increment the cascade count for the next potential fall within the same spin.
        this.cascadeCount++;
    }
}
