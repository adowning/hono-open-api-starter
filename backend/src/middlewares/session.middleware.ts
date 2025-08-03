// src/middlewares/session.middleware.ts
import type { Context, Next } from 'hono'
import chalk from 'chalk'

import { SessionManager } from '#/lib/session.manager'

export async function sessionMiddleware(c: Context, next: Next) {
    console.log(chalk.cyan('--- Session Middleware Start ---'))

    const user = c.get('user')
    if (!user) {
        console.log(chalk.red('Error: User not found in context.'))
        return c.json({ error: 'User not authenticated' }, 401)
    }

    if (c.req.url.includes('/game/spin')) {
        const sessionId = user.currentGameSessionDataId
        if (!sessionId) {
            console.log(
                chalk.red('Error: No current game session ID found on user object.')
            )
            return c.json({ message: 'No active game session found.' }, 404)
        }

        const gameSession = await SessionManager.getGameSession(sessionId)
        if (!gameSession) {
            console.log(
                chalk.red(`Error: Game session not found for ID: ${sessionId}`)
            )
            return c.json({ message: 'Game session has expired or is invalid.' }, 404)
        }
        c.set('gameSession', gameSession)
    }

    console.log(chalk.cyan('--- Session Middleware End ---'))
    return next()
}
