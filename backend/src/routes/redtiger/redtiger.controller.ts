import type { Context } from 'hono'
import chalk from 'chalk'

import type { UserWithRelations } from '#/db/schema'

import {
    rtgSettingsRequestDtoSchema,
    rtgSpinRequestDtoSchema,
} from '#/db/schema'
import { SessionManager } from '#/lib/session.manager'

import { createRedtigerSettings, createRedtigerSpin } from './redtiger.service'

export const redtigerController = {
    settings: async (c: Context) => {
        console.log(chalk.magenta('redtigerController gettingSettings'))
        const body = await c.req.json()
        const data = rtgSettingsRequestDtoSchema.parse(body)
        const user = c.get('user') as UserWithRelations
        const authSession = c.get('authSession')
        if (!data.gamesId || !authSession) {
            return c.json({ message: 'not authenticated' }, 401)
        }

        const gameName = `${data.gamesId}RTG`

        const gameSession = await SessionManager.startGameSession(c, gameName)

        if (!gameSession) {
            return c.json({ message: 'no gameSession' }, 404)
        }
        c.set('gameSession', gameSession)

        const settings = await createRedtigerSettings(
            user,
            gameName,
            gameSession.id,
            data
        )
        if (settings && settings.result && settings.result.user) {
            settings.result.user.sessionId = gameSession.id
        }
        return c.json(settings)
    },
    spin: async (c: Context) => {
        const body = await c.req.json()
        const data = rtgSpinRequestDtoSchema.parse(body)
        const user = c.get('user') as UserWithRelations
        if (!user) {
            return c.json({ message: 'not authenticated' }, 401)
        }

        const gameSession = c.get('gameSession')
        if (!gameSession) {
            return c.json({ message: 'no gameSession RT46' }, 404)
        }

        const gameName = `${data.gamesId}RTG`
        if (!gameName) {
            return c.json({ message: 'no gameName' }, 404)
        }

        const spin = await createRedtigerSpin(c, data)
        return c.json(spin)
    },
}