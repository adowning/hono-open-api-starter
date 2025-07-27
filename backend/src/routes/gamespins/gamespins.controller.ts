import db from '#/db'
import { GameSpin } from '#/db/slim.schema'
import { desc, gt } from 'drizzle-orm'
import type { Context } from 'hono'

export async function getTopWins(c: Context) {
    let result = await db
        .select()
        .from(GameSpin)
        .where(gt(GameSpin.grossWinAmount, 0))
        .orderBy(desc(GameSpin.grossWinAmount))
    // .limit(limit)
    console.log(result)
    if (result === undefined)
        result = []
    return c.json(result)
}
