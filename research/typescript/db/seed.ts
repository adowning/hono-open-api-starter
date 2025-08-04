// file: db/seed.ts

import { Pool, PoolClient } from 'pg';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcrypt';

// --- Data for Piggy Riches ---
const PIGGY_RICHES_PAY_TABLE = {
    3:{2:5,3:25,4:300,5:2000},4:{3:25,4:150,5:1000},5:{3:20,4:125,5:750},6:{3:20,4:75,5:400},7:{3:15,4:75,5:200},8:{3:15,4:50,5:125},9:{3:10,4:25,5:100},10:{3:5,4:20,5:75},11:{3:5,4:15,5:60},12:{3:5,4:10,5:50},
};
const PIGGY_RICHES_SCATTER_PAY_TABLE = {
    2:{payout:2,freeSpins:0},3:{payout:4,freeSpins:15},4:{payout:15,freeSpins:15},5:{payout:100,freeSpins:15},
};
const PIGGY_RICHES_PAYLINES = [
    [[0,1],[1,1],[2,1],[3,1],[4,1]],[[0,0],[1,0],[2,0],[3,0],[4,0]],[[0,2],[1,2],[2,2],[3,2],[4,2]],[[0,0],[1,1],[2,2],[3,1],[4,0]],[[0,2],[1,1],[2,0],[3,1],[4,2]],[[0,1],[1,0],[2,0],[3,0],[4,1]],[[0,1],[1,2],[2,2],[3,2],[4,1]],[[0,0],[1,1],[2,1],[3,1],[4,0]],[[0,2],[1,1],[2,1],[3,1],[4,2]],[[0,1],[1,0],[2,1],[3,2],[4,1]],[[0,1],[1,2],[2,1],[3,0],[4,1]],[[0,0],[1,2],[2,0],[3,2],[4,0]],[[0,2],[1,0],[2,2],[3,0],[4,2]],[[0,1],[1,1],[2,0],[3,1],[4,1]],[[0,1],[1,1],[2,2],[3,1],[4,1]],
];
const PIGGY_RICHES_REELS = {
    '96.077223': [
        [4,12,11,10,6,9,8,12,11,5,12,9,7,3,8,2,12,6,10,9,11,8,4,10,9,11,12,10,11,6,12,1,8,9,7,10,11,5,7],[8,9,10,12,11,3,9,12,7,8,9,12,7,11,6,12,11,7,5,4,10,9,12,10,5,8,10,12,11,4,10,2,6,9,11,8,6,11,1],[4,10,1,7,9,10,11,8,10,12,8,11,12,6,11,12,7,9,5,12,11,9,12,11,2,6,12,9,10,7,11,6,10,5,8,3,4,9,8],[12,7,11,8,12,3,10,9,5,7,9,4,8,11,7,10,12,6,8,11,1,6,12,2,11,10,6,5,9,4,10,9,12,10,11,9,12,11,8],[8,12,6,11,10,4,12,10,11,9,5,6,10,7,9,11,7,3,2,8,11,12,4,8,9,11,10,1,9,12,8,11,7,12,6,9,10,12,5]
    ],
};

// --- Data for Gonzo's Quest ---
const GONZOS_QUEST_PAY_TABLE = {
    3: { 3: 50, 4: 250, 5: 2500 }, 4: { 3: 20, 4: 100, 5: 1000 }, 5: { 3: 15, 4: 50, 5: 500 },
    6: { 3: 10, 4: 25, 5: 200 }, 7: { 3: 5, 4: 20, 5: 100 }, 8: { 3: 4, 4: 15, 5: 75 }, 9: { 3: 3, 4: 10, 5: 50 },
};
const GONZOS_QUEST_SCATTER_PAY_TABLE = {
    3: { payout: 0, freeSpins: 10 },
};
const GONZOS_QUEST_PAYLINES = [
    [[0,1],[1,1],[2,1],[3,1],[4,1]],[[0,0],[1,0],[2,0],[3,0],[4,0]],[[0,2],[1,2],[2,2],[3,2],[4,2]],[[0,0],[1,1],[2,2],[3,1],[4,0]],[[0,2],[1,1],[2,0],[3,1],[4,2]],
    [[0,1],[1,0],[2,0],[3,0],[4,1]],[[0,1],[1,2],[2,2],[3,2],[4,1]],[[0,0],[1,1],[2,1],[3,1],[4,0]],[[0,2],[1,1],[2,1],[3,1],[4,2]],[[0,1],[1,0],[2,1],[3,2],[4,1]],
    [[0,1],[1,2],[2,1],[3,0],[4,1]],[[0,0],[1,2],[2,0],[3,2],[4,0]],[[0,2],[1,0],[2,2],[3,0],[4,2]],[[0,1],[1,1],[2,0],[3,1],[4,1]],[[0,1],[1,1],[2,2],[3,1],[4,1]],
    [[0,0],[1,2],[2,2],[3,2],[4,0]],[[0,2],[1,0],[2,0],[3,0],[4,2]],[[0,0],[1,2],[2,0],[3,2],[4,0]],[[0,2],[1,0],[2,2],[3,0],[4,2]],[[0,1],[1,0],[2,2],[3,0],[4,1]],
];
const GONZOS_QUEST_REELS = {
    '96.311812': [
        [6,5,7,6,9,5,2,6,9,8,6,7,9,6,8,4,5,7,3,9,8,3,7,9,6,7,8,5,7,2,8,9,4,8],[6,5,4,3,7,6,3,4,7,9,3,5,6,3,9,5,3,4,5,3,8,4,6,5,9,2,4,7,6,1,4,5,8,6,4,5,8],[6,7,9,8,3,9,5,7,9,8,7,9,6,7,5,8,4,2,9,6,5,8,7,9,1,3,7,6,8,4,9,8,3,4],[5,6,8,3,9,4,3,9,8,5,4,3,5,6,8,9,4,3,7,6,5,7,6,4,3,5,4,3,5,6,4,5,1,7,6,4],[7,8,9,7,6,9,8,5,6,8,9,7,5,8,3,9,4,6,3,9,7,6,8,5,6,7,9,8,5,7,6,4]
    ]
};

async function seedUsers(client: PoolClient) {
    console.log("\n--- Seeding Users ---");
    const email = 'player@example.com';
    const plainPassword = 'password123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    // Insert a test user, or do nothing if the user already exists.
    const res = await client.query(
        `INSERT INTO users (email, password_hash, balance) VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING RETURNING id`,
        [email, passwordHash, 1000.00]
    );

    if (res.rows.length > 0) {
        console.log(`Test user 'player@example.com' created with password 'password123'.`);
    } else {
        console.log(`Test user 'player@example.com' already exists.`);
    }
}


async function seedGame(client: PoolClient, gameName: string, provider: string, bonusKey: string, payTable: any, scatterTable: any, paylines: any, reels: any) {
    console.log(`\n--- Seeding '${gameName}' ---`);
    const gameRes = await client.query(
        "INSERT INTO games (name, provider, reel_width, reel_height, bonus_handler_key) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO UPDATE SET provider = $2 RETURNING id",
        [gameName, provider, 5, 3, bonusKey]
    );
    
    const gameId = gameRes.rows[0].id;
    console.log(`Game '${gameName}' ready with ID: ${gameId}. Clearing old data...`);
    
    await client.query('DELETE FROM paylines WHERE game_id = $1', [gameId]);
    await client.query('DELETE FROM pay_tables WHERE game_id = $1', [gameId]);
    await client.query('DELETE FROM reel_sets WHERE game_id = $1', [gameId]);

    for (let i = 0; i < paylines.length; i++) {
        await client.query("INSERT INTO paylines (game_id, line_number, positions) VALUES ($1, $2, $3)", [gameId, i + 1, JSON.stringify(paylines[i])]);
    }
    console.log(`Inserted ${paylines.length} paylines.`);

    for (const [symbolId, payouts] of Object.entries(payTable)) {
        for (const [matches, multiplier] of Object.entries(payouts as any)) {
            await client.query("INSERT INTO pay_tables (game_id, symbol_id, matches, payout_multiplier) VALUES ($1, $2, $3, $4)", [gameId, parseInt(symbolId), parseInt(matches), multiplier]);
        }
    }
    for (const [matches, scatterInfo] of Object.entries(scatterTable)) {
         await client.query("INSERT INTO pay_tables (game_id, symbol_id, matches, payout_multiplier, is_scatter, free_spins_awarded) VALUES ($1, $2, $3, $4, $5, $6)", [gameId, 2, parseInt(matches), (scatterInfo as any).payout, true, (scatterInfo as any).freeSpins]);
    }
    console.log("Inserted pay tables.");

    for (const [rtp, strips] of Object.entries(reels)) {
        const reelSetRes = await client.query("INSERT INTO reel_sets (game_id, rtp_percent) VALUES ($1, $2) RETURNING id", [gameId, parseFloat(rtp)]);
        const reelSetId = reelSetRes.rows[0].id;
        for (let i = 0; i < (strips as any).length; i++) {
            await client.query("INSERT INTO reel_strips (reel_set_id, reel_index, strip_data) VALUES ($1, $2, $3)", [reelSetId, i, (strips as any)[i]]);
        }
    }
    console.log(`Inserted ${Object.keys(reels).length} reel set(s).`);
}


async function seed() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();
    console.log("Connected to database.");

    try {
        console.log("Ensuring database schema exists...");
        const schemaSql = fs.readFileSync(path.join(__dirname, '..', '..', 'db', 'schema.sql'), 'utf8');
        await client.query(schemaSql);
        console.log("Schema is up to date.");

        await client.query('BEGIN');
        
        // Seed users first
        await seedUsers(client);

        // Then seed games
        await seedGame(client, 'Piggy Riches', 'NetEnt', 'PiggyRichesFS', PIGGY_RICHES_PAY_TABLE, PIGGY_RICHES_SCATTER_PAY_TABLE, PIGGY_RICHES_PAYLINES, PIGGY_RICHES_REELS);
        await seedGame(client, "Gonzo's Quest", 'NetEnt', 'Cascade', GONZOS_QUEST_PAY_TABLE, GONZOS_QUEST_SCATTER_PAY_TABLE, GONZOS_QUEST_PAYLINES, GONZOS_QUEST_REELS);

        await client.query('COMMIT');
        console.log("\nSeeding completed successfully for all data!");

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Failed to seed database. Rolled back transaction.", e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(err => {
    console.error("An error occurred during the seeding process:", err);
    process.exit(1);
});
