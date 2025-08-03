import db from '#/db'
import { gameSpins } from '#/db/schema'
import { desc, gt } from 'drizzle-orm'
import type { Context } from 'hono'

export async function getTopWins(c: Context) {
    let result = await db
        .select()
        .from(gameSpins)
        .where(gt(gameSpins.grossWinAmount, 0))
        .orderBy(desc(gameSpins.grossWinAmount))
    // .limit(limit)
    if (result === undefined)
        result = []
    return c.json(result)
}
