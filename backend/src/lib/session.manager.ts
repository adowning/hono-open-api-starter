/* eslint-disable style/indent-binary-ops */
// src/lib/session.manager.ts
import type { Context } from 'hono'

import chalk from 'chalk'
import { and, eq } from 'drizzle-orm'

import type { AuthSessionType, GameSessionType, UserType } from '#/db/schema'

import db from '#/db'
import { AuthSession, Game, GameSession, GameSpin, User } from '#/db/schema'
import {
    deleteGameSessionFromCache,
    deleteSpinsFromCache,
    getGameSessionFromCache,
    getSpinsFromCache,
    saveGameSessionToCache,
} from '#/lib/cache'
import { triggerUserUpdate } from '#/lib/websocket.service'
import { nanoid } from '#/utils/nanoid'

const IDLE_TIMEOUT = 10 * 60 * 1000 // 10 minutes

export class SessionManager {
    // --- Auth Session Management ---
    // --- Auth Session Management ---

    static async startAuthSession(userId: string): Promise<AuthSessionType> {
        const [authSession] = await db
            .insert(AuthSession)
            .values({
                userId,
                status: 'ACTIVE',
            })
            .returning()
        return authSession
    }

    static async endAuthSession(
        authSessionId: string,
        userId: string
    ): Promise<void> {
        try {
            await db
                .update(AuthSession)
                .set({ status: 'EXPIRED' })
                .where(eq(AuthSession.id, authSessionId))
        } catch (error) {
            console.error(`Failed to end auth session ${authSessionId}:`, error)
            // Continue to end game session even if auth session update fails
        }

        try {
            await this.endCurrentGameSession(userId)
        } catch (error) {
            console.error(
                `Failed to end game session for user ${userId}:`,
                error
            )
            // Continue even if game session end fails
        }
    }

    /**
     * Ends all active sessions for a specific user. This is useful
     * during login to ensure a clean state.
     * @param userId - The ID of the user.
     */
    static async endAllUserSessions(userId: string): Promise<void> {
        console.log(
            chalk.yellow(`Ending all previous sessions for user ${userId}...`)
        )

        try {
            // First, end any active game session, as its state might need to be persisted.
            await this.endCurrentGameSession(userId)

            // Get all active session IDs first
            const activeSessions = await db
                .select({ id: AuthSession.id })
                .from(AuthSession)
                .where(
                    and(
                        eq(AuthSession.userId, userId),
                        eq(AuthSession.status, 'ACTIVE')
                    )
                )

            // Update sessions one by one to avoid potential deadlocks
            for (const session of activeSessions) {
                try {
                    await db
                        .update(AuthSession)
                        .set({ status: 'EXPIRED' })
                        .where(eq(AuthSession.id, session.id))
                } catch (error) {
                    console.error(`Failed to end session ${session.id}:`, error)
                    // Continue with other sessions even if one fails
                }
            }
        } catch (error) {
            console.error('Error in endAllUserSessions:', error)
            throw error // Re-throw to be handled by the caller
        }
    }

    // --- Game Session Management ---

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

        const game = await db.query.Game.findFirst({
            where: eq(Game.name, gameName),
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
            createdAt: new Date(),
            endedAt: null,
            duration: 0,
            totalWagered: 0,
            totalWon: 0,
            rtp: null,
            totalXpGained: 0,
        }
        console.log(
            chalk.bgCyan('Starting new game session for user:', user.id)
        )
        await db.insert(GameSession).values(newSessionData)
        await db
            .update(User)
            .set({ currentGameSessionDataId: newSessionData.id })
            .where(eq(User.id, user.id))

        await saveGameSessionToCache(newSessionData, c)
        c.set('user', { ...user, currentGameSessionDataId: newSessionData.id })
        const u = c.get('user')
        console.log('user', u)
        triggerUserUpdate(user.id)

        return newSessionData
    }

    static async endCurrentGameSession(userId: string): Promise<void> {
        const activeSession = await db.query.GameSession.findFirst({
            where: and(
                eq(GameSession.userId, userId),
                eq(GameSession.status, 'ACTIVE')
            ),
        })

        if (!activeSession) {
            return
        }

        console.log(
            chalk.bgBlue(
                'Ending session and persisting data for session:',
                activeSession.id
            )
        )

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
                .update(GameSession)
                .set({
                    status: 'COMPLETED',
                    endedAt: now,
                    duration,
                    totalWagered: sessionFromCache.totalWagered,
                    totalWon: sessionFromCache.totalWon,
                    totalXpGained: sessionFromCache.totalXpGained,
                    rtp: finalRtp.toFixed(2),
                })
                .where(eq(GameSession.id, activeSession.id))

            if (sessionSpins.length > 0) {
                const spinsToCreate = sessionSpins.map((spin, i) => ({
                    ...spin,
                    id: nanoid(),
                    gameSessionId: activeSession.id,
                    sessionId: activeSession.id,
                    spinNumber: i + 1,
                    grossWinAmount: spin.grossWinAmount ?? 0,
                    wagerAmount: spin.wagerAmount ?? 0,
                    occurredAt: spin.createdAt ?? new Date(),
                }))
                await tx.insert(GameSpin).values(spinsToCreate)
            }

            await tx
                .update(User)
                .set({ currentGameSessionDataId: null })
                .where(eq(User.id, userId))
        })

        await deleteGameSessionFromCache(activeSession.id)
        await deleteSpinsFromCache(activeSession.id)
        triggerUserUpdate(userId)
    }

    static async getGameSession(
        sessionId: string
    ): Promise<GameSessionType | null> {
        return getGameSessionFromCache(sessionId)
    }

    static async handleIdleSession(c: Context): Promise<void> {
        const user = c.get('user') as UserType
        if (!user?.currentGameSessionDataId) {
            return
        }

        const gameSession = await getGameSessionFromCache(
            user.currentGameSessionDataId
        )

        if (gameSession) {
            const now = new Date()
            const lastSeenValue = (gameSession as any).lastSeen
            const lastSeen = lastSeenValue ? new Date(lastSeenValue) : now
            const timeDiff = now.getTime() - lastSeen.getTime()

            if (timeDiff > IDLE_TIMEOUT) {
                console.log(
                    chalk.yellow(
                        `Session ${gameSession.id} timed out due to inactivity.`
                    )
                )
                await this.endCurrentGameSession(user.id)
                c.set('gameSession', null)
            } else {
                ;(gameSession as any).lastSeen = now
                console.log(chalk.yellow('game session time changed to ', now))
                await saveGameSessionToCache(gameSession, c)
            }
        }
    }
}
