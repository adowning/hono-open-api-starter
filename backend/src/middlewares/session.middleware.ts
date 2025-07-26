// src/middlewares/session.middleware.ts
import type { Context, Next } from 'hono'

import { SessionManager } from '#/lib/session.manager'
import chalk from 'chalk'

export async function sessionMiddleware(c: Context, next: Next) {
    console.log(chalk.green('Session middleware called'))
    const user = c.get('user')
    if (c.req.url.includes('/updates/check')) {
        return next()
    } else {
        console.log(user.currentGameSessionDataId)
        if (!user || !user.currentGameSessionDataId) {
            return next()
            // return c.json({ error: 'User not authenticated' }, 401)
        } else {
            console.log('currentGameSessionDataId ')
            console.log(user.currentGameSessionDataId)
            await SessionManager.handleIdleSession(c)
            const session = await SessionManager.getGameSession(
                user.currentGameSessionDataId
            )
            console.log(session?.id)
            if (!session) {
                // return c.json({ error: 'Game session not found' }, 404)
                return next()
            }
            // c.set('session', session)
        }
        return next()
    }
}
