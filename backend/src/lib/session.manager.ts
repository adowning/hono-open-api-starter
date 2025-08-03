/* eslint-disable style/indent-binary-ops */
// src/lib/session.manager.ts
import type { Context } from 'hono'

import chalk from 'chalk'
import { and, eq } from 'drizzle-orm'

import type { AuthSessionType, GameSessionType, UserType } from '#/db/schema'

import db from '#/db'
import { authSessions, games, gameSessions, gameSpins, users } from '#/db/schema'
import {
    deleteAuthSessionFromCache,
    deleteGameSessionFromCache,
    deleteSpinsFromCache,
    getAuthSessionFromCache,
    getGameSessionFromCache,
    getSpinsFromCache,
    saveAuthSessionToCache,
    saveGameSessionToCache,
} from '#/lib/cache'
import { triggerUserUpdate } from '#/lib/websocket.service'
import { nanoid } from '#/utils/nanoid'

const IDLE_TIMEOUT = 10 * 60 * 1000 // 10 minutes

export class SessionManager {
    static async startAuthSession(user: UserType): Promise<AuthSessionType> {
        const id = nanoid()
        console.log(chalk.cyan(`[SessionManager] Creating auth session id=${id} for user=${user.id}`))

        const inserted = await db
            .insert(authSessions)
            .values({
                id,
                userId: user.id,
                status: 'ACTIVE',
            })
            .returning()

        const authSession = inserted?.[0]
        if (!authSession) {
            console.error(chalk.red(`[SessionManager] Insert did not return row for id=${id}`))
            throw new Error('Failed to create auth session')
        }

        // Post-insert verification to ensure persistence and ACTIVE status
        const verified = await db.query.authSessions.findFirst({
            where: and(eq(authSessions.id, authSession.id), eq(authSessions.status, 'ACTIVE')),
        })

        if (!verified) {
            console.error(
                chalk.red(
                    `[SessionManager] Verification failed: session not found or not ACTIVE id=${authSession.id}`
                )
            )
            // Best-effort: mark as expired to avoid dangling
            try {
                await db.update(authSessions).set({ status: 'EXPIRED' }).where(eq(authSessions.id, authSession.id))
            } catch {}
            throw new Error('Auth session was not persisted as ACTIVE')
        }

        await saveAuthSessionToCache(verified)
        console.log(chalk.green(`[SessionManager] Auth session ACTIVE and cached id=${verified.id}`))
        return verified as AuthSessionType
    }

    static async endAuthSession(
        authSessionId: string,
        userId: string
    ): Promise<void> {
        await db
            .update(authSessions)
            .set({ status: 'EXPIRED' })
            .where(eq(authSessions.id, authSessionId))
        await deleteAuthSessionFromCache(authSessionId)
        await this.endCurrentGameSession(userId)
    }

    static async endAllUserSessions(userId: string): Promise<void> {
        console.log(
            chalk.yellow(`Ending all previous sessions for user ${userId}...`)
        )
        await this.endCurrentGameSession(userId)
        const activeSessions = await db
            .select({ id: authSessions.id })
            .from(authSessions)
            .where(
                and(
                    eq(authSessions.userId, userId),
                    eq(authSessions.status, 'ACTIVE')
                )
            )

        for (const session of activeSessions) {
            await db
                .update(authSessions)
                .set({ status: 'EXPIRED' })
                .where(eq(authSessions.id, session.id))
            await deleteAuthSessionFromCache(session.id)
        }
    }

    static async getAuthSession(
        sessionId: string
    ): Promise<AuthSessionType | null> {
        let session: any = await getAuthSessionFromCache(sessionId)
        if (session) {
            return session
        }

        session = await db.query.authSessions.findFirst({
            where: and(
                eq(authSessions.id, sessionId),
                eq(authSessions.status, 'ACTIVE')
            ),
        })

        if (session) {
            await saveAuthSessionToCache(session)
        }

        return session || null
    }

    static async startGameSession(
        c: Context,
        gameName: string
    ): Promise<GameSessionType> {
        const user = c.get('user') as UserType
        const authSession = c.get('authSession') as AuthSessionType

        if (!user || !authSession) {
            throw new Error('User not authenticated.')
        }

        await this.endCurrentGameSession(user.id)

        const game = await db.query.games.findFirst({
            where: eq(games.name, gameName),
        })
        if (!game) {
            throw new Error(`Game with name "${gameName}" not found.`)
        }

        const newSessionData: GameSessionType = {
            id: nanoid(),
            userId: user.id,
            authSessionId: authSession.id,
            gameId: game.id,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            endAt: null,
            duration: 0,
            totalWagered: 0,
            totalWon: 0,
            rtp: null,
            totalXpGained: 0,
        }

        await db.insert(gameSessions).values(newSessionData)
        await db
            .update(users)
            .set({ currentGameSessionDataId: newSessionData.id })
            .where(eq(users.id, user.id))

        await saveGameSessionToCache(newSessionData)
        c.set('user', { ...user, currentGameSessionDataId: newSessionData.id })
        triggerUserUpdate(user.id)

        return newSessionData
    }

    static async endCurrentGameSession(userId: string): Promise<void> {
        const activeSession = await db.query.gameSessions.findFirst({
            where: and(
                eq(gameSessions.userId, userId),
                eq(gameSessions.status, 'ACTIVE')
            ),
        })

        if (!activeSession) {
            return
        }

        const sessionSpins = await getSpinsFromCache(activeSession.id)
        const sessionFromCache =
            (await getGameSessionFromCache(activeSession.id)) || activeSession

        await db.transaction(async (tx) => {
            const now = new Date()
            const finalRtp =
                sessionFromCache.totalWagered > 0
                    ? (sessionFromCache.totalWon /
                          sessionFromCache.totalWagered) *
                      100
                    : 0
            const duration = Math.round(
                (now.getTime() -
                    new Date(sessionFromCache.createdAt).getTime()) /
                    1000
            )

            await tx
                .update(gameSessions)
                .set({
                    status: 'COMPLETED',
                    endAt: now.toISOString(),
                    duration,
                    totalWagered: sessionFromCache.totalWagered,
                    totalWon: sessionFromCache.totalWon,
                    totalXpGained: sessionFromCache.totalXpGained,
                    rtp: finalRtp.toFixed(2),
                })
                .where(eq(gameSessions.id, activeSession.id))

            if (sessionSpins.length > 0) {
                const spinsToCreate = sessionSpins.map((spin, i) => ({
                    ...spin,
                    // The spin.id from the cache (provider's roundId) must be preserved
                    // to maintain relations (e.g., to jackpot wins).
                    sessionId: activeSession.id,
                    spinNumber: i + 1,
                    grossWinAmount: spin.grossWinAmount ?? 0,
                    wagerAmount: spin.wagerAmount ?? 0,
                    occurredAt: spin.createdAt ?? new Date().toISOString(),
                }))
                await tx.insert(gameSpins).values(spinsToCreate)
            }

            await tx
                .update(users)
                .set({ currentGameSessionDataId: null })
                .where(eq(users.id, userId))
        })

        await deleteGameSessionFromCache(activeSession.id)
        await deleteSpinsFromCache(activeSession.id)
        triggerUserUpdate(userId)
    }

    static async getGameSession(
        sessionId: string
    ): Promise<GameSessionType | null> {
        let session: any = await getGameSessionFromCache(sessionId)
        if (session) {
            return session
        }

        session = await db.query.gameSessions.findFirst({
            where: eq(gameSessions.id, sessionId),
        })

        if (session) {
            await saveGameSessionToCache(session)
        }

        return session || null
    }

    static async handleIdleSession(c: Context): Promise<void> {
        const user = c.get('user') as UserType
        if (!user?.currentGameSessionDataId) {
            return
        }

        const gameSession = await this.getGameSession(
            user.currentGameSessionDataId
        )

        if (gameSession) {
            const now = new Date()
            const lastSeenValue = (gameSession as any).lastSeen
            const lastSeen = lastSeenValue ? new Date(lastSeenValue) : now
            const timeDiff = now.getTime() - lastSeen.getTime()

            if (timeDiff > IDLE_TIMEOUT) {
                await this.endCurrentGameSession(user.id)
                c.set('gameSession', null)
            } else {
                ;(gameSession as any).lastSeen = now
                await saveGameSessionToCache(gameSession)
            }
        }
    }
}
