import { desc, gt } from 'drizzle-orm'
import { z } from 'zod'
import db from '#/db'
import { GameSpin } from '#/db/slim.schema'

export async function getTopWins(limit = 10) {
    return db
        .select()
        .from(GameSpin)
        .where(gt(GameSpin.grossWinAmount, 0))
        .orderBy(desc(GameSpin.grossWinAmount))
        .limit(limit)
}

export const GameSpinResponseSchema = z.object({
    id: z.string(),
    playerName: z.string().optional(),
    gameName: z.string().optional(),
    spinData: z.record(z.any()).optional(),
    grossWinAmount: z.number(),
    wagerAmount: z.number(),
    spinNumber: z.number(),
    playerAvatar: z.string().optional(),
    currencyId: z.string().optional(),
    sessionId: z.string(),
    userId: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    occurredAt: z.string().datetime(),
    sessionDataId: z.string().optional(),
})

export const GameSpinListResponseSchema = z.array(GameSpinResponseSchema)
