import 'dotenv/config';

// --- DEBUGGING STEP ---
console.log(`[DEBUG] JWT_SECRET on startup: ${process.env.JWT_SECRET}`);
// --- END DEBUGGING STEP ---

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { GameRepository } from './data/GameRepository';
import { GameManager } from './logic/GameManager';
import { AuthenticatedRequest, authenticateToken } from './middleware/auth';

// A simple repository for user data
class UserRepository {
    constructor(private db: Pool) { }

    async findByEmail(email: string) {
        const res = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0];
    }

    async getBalance(userId: number): Promise<number> {
        const res = await this.db.query('SELECT balance FROM users WHERE id = $1', [userId]);
        if (res.rows.length === 0) throw new Error('User not found');
        return parseFloat(res.rows[0].balance);
    }

    async updateBalance(userId: number, newBalance: number): Promise<void> {
        await this.db.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);
    }
}


async function main() {
    const app = express();
    const port = process.env.PORT || 3000;

    // Create a single, shared database pool AFTER dotenv has loaded.
    const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Pass the shared pool to both repositories.
    const gameRepo = new GameRepository(dbPool);
    const userRepo = new UserRepository(dbPool);
    const gameManager = new GameManager(gameRepo);

    app.use(express.json());

    // --- LOGIN ENDPOINT ---
    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await userRepo.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const secret = process.env.JWT_SECRET;
        console.log(secret)
        if (!secret) {
            return res.status(500).json({ error: 'JWT secret not configured' });
        }

        // Token payload contains the user's ID
        const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
        res.json({ token });
    });


    // --- SPIN ENDPOINT (NOW STATEFUL) ---
    app.post('/games/:gameName/spin', authenticateToken, async (req: AuthenticatedRequest, res) => {
        const { gameName } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(403).json({ error: 'Forbidden: No user ID in token' });
        }

        const rtp = parseFloat(req.body.rtp || '96.0');
        const betPerLine = parseInt(req.body.bet || '1');
        const selectedLines = parseInt(req.body.lines || '20');
        const totalBet = betPerLine * selectedLines;

        try {
            let currentBalance = await userRepo.getBalance(userId);

            if (currentBalance < totalBet) {
                return res.status(402).json({ error: 'Insufficient funds' });
            }

            currentBalance -= totalBet;

            const game = await gameManager.getGame(gameName, rtp);
            game.betPerLine = betPerLine;
            game.selectedLines = selectedLines;

            game.spin();
            const wins = game.calculateWins();
            const totalWin = wins.reduce((acc, w) => acc + (w.pay * w.mult), 0);

            currentBalance += totalWin;
            await userRepo.updateBalance(userId, currentBalance);

            res.json({
                game: gameName,
                screen: game.screen,
                wins: wins,
                totalWin: totalWin,
                newBalance: currentBalance.toFixed(2),
            });

        } catch (error: any) {
            console.error(`Error spinning game ${gameName}:`, error);
            res.status(404).json({ error: error.message });
        }
    });

    app.listen(port, () => {
        console.log(`Slot server listening on http://localhost:${port}`);
    });

    process.on('SIGINT', async () => {
        console.log("\nShutting down server...");
        await gameRepo.disconnect();
        await dbPool.end();
        console.log("Database connections closed.");
        process.exit(0);
    });
}

main().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});