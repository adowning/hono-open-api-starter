import { GameRepository } from '../data/GameRepository';
import { GameDefinition } from '../types';
import { IBonusHandler, StandardGame } from './StandardGame';
import { CascadeHandler } from './bonus/CascadeHandler';

export class GameManager {
    private repo: GameRepository;
    private cache: Map<string, GameDefinition> = new Map();

    constructor(repo: GameRepository) {
        this.repo = repo;
    }

    public async getGame(name: string, rtp: number): Promise<StandardGame> {
        let def = this.cache.get(name);

        if (!def) {
            console.log(`Cache miss for '${name}'. Loading from database...`);
            def = await this.repo.getGameByName(name);
            this.cache.set(name, def);
        }

        // Strategy Pattern: Select the correct bonus logic.
        let bonusHandler: IBonusHandler | undefined = undefined;
        switch (def.bonusHandlerKey) {
            case 'Cascade':
                bonusHandler = new CascadeHandler();
                break;
            // Add other bonus handlers here in the future
        }

        return new StandardGame(def, rtp, bonusHandler);
    }
}
