// file: src/data/GameRepository.ts

import { Pool } from 'pg';
import { GameDefinition, Payline, PayTable, ReelSet, ScatterPayTable } from '../types';

export class GameRepository {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    public async getGameByName(name: string): Promise<GameDefinition> {
        const client = await this.db.connect();
        try {
            // 1. Get base game info
            const gameRes = await client.query('SELECT * FROM games WHERE name = $1', [name]);
            if (gameRes.rows.length === 0) {
                throw new Error(`Game not found: ${name}`);
            }
            const gameRow = gameRes.rows[0];
            const gameId = gameRow.id;

            // 2. Get paylines
            const paylinesRes = await client.query('SELECT positions FROM paylines WHERE game_id = $1 ORDER BY line_number ASC', [gameId]);
            const paylines: Payline[] = paylinesRes.rows.map((r: { positions: any; }) => r.positions);

            // 3. Get pay tables
            const payTablesRes = await client.query('SELECT * FROM pay_tables WHERE game_id = $1', [gameId]);
            const payTable: PayTable = {};
            const scatterPayTable: ScatterPayTable = {};
            for (const row of payTablesRes.rows) {
                if (row.is_scatter) {
                    scatterPayTable[row.matches] = {
                        payout: parseFloat(row.payout_multiplier),
                        freeSpins: row.free_spins_awarded,
                    };
                } else {
                    if (!payTable[row.symbol_id]) {
                        payTable[row.symbol_id] = {};
                    }
                    payTable[row.symbol_id][row.matches] = parseFloat(row.payout_multiplier);
                }
            }

            // 4. Get reel sets and strips
            const reelSetsRes = await client.query('SELECT * FROM reel_sets WHERE game_id = $1', [gameId]);
            const reelSets: { [rtp: number]: ReelSet } = {};
            for (const reelSetRow of reelSetsRes.rows) {
                const reelSetId = reelSetRow.id;
                const stripsRes = await client.query('SELECT strip_data FROM reel_strips WHERE reel_set_id = $1 ORDER BY reel_index ASC', [reelSetId]);
                const strips = stripsRes.rows.map((r: { strip_data: any; }) => r.strip_data);
                reelSets[parseFloat(reelSetRow.rtp_percent)] = {
                    id: reelSetId,
                    rtp: parseFloat(reelSetRow.rtp_percent),
                    strips: strips,
                };
            }

            // 5. Assemble the final definition
            const definition: GameDefinition = {
                id: gameId,
                name: gameRow.name,
                provider: gameRow.provider,
                reelWidth: gameRow.reel_width,
                reelHeight: gameRow.reel_height,
                bonusHandlerKey: gameRow.bonus_handler_key,
                paylines,
                payTable,
                scatterPayTable,
                reelSets,
            };

            return definition;

        } finally {
            client.release();
        }
    }

    public async disconnect(): Promise<void> {
        await this.db.end();
    }
}
