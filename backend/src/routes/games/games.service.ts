import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { Context } from 'hono'

import { GameCategory, Game, FavoriteGame, GameHistory } from '#/db/schema'
import db from '#/db'
import { nanoid } from '#/utils/nanoid'
import type { AuthSessionType, UserType } from '#/db/schema'
import { SessionManager } from '#/lib/session.manager'

export function findGameCategories() {
    return GameCategory.enumValues
}

export async function findAllGames() {
    return db.query.Game.findMany({
        columns: {
            id: true,
            name: true,
            title: true,
            category: true,
            providerName: true,
            thumbnailUrl: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: desc(Game.name),
    })
}

export async function searchGames(params: {
    game_categories_slug?: string
    page: number
    limit: number
}) {
    const where = params.game_categories_slug
        ? eq(Game.category, params.game_categories_slug)
        : undefined
    const games = await db.query.Game.findMany({
        where,
        limit: params.limit,
        offset: (params.page - 1) * params.limit,
    })
    const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(Game)
        .where(where)
    return { games, total: totalCount[0].count }
}

export async function findUserGames(
    userId: string,
    params: { game_categories_slug: string; page: number; limit: number }
) {
    const page = params.page || 1
    const limit = params.limit || 10
    const offset = (page - 1) * limit

    if (params.game_categories_slug === 'favorite') {
        const favoriteGameIds = await db.query.FavoriteGame.findMany({
            where: eq(FavoriteGame.userId, userId),
            columns: { gameId: true },
        })

        if (favoriteGameIds.length === 0) return { games: [], total: 0 }

        const gameIds = favoriteGameIds.map((f) => f.gameId)

        const favGames = await db.query.Game.findMany({
            where: inArray(Game.id, gameIds),
            limit,
            offset,
        })
        return { games: favGames, total: gameIds.length }
    } else if (params.game_categories_slug === 'history') {
        const history = await db.query.GameHistory.findMany({
            where: eq(GameHistory.userId, userId),
            orderBy: desc(GameHistory.createdAt),
            limit,
            offset,
        })

        const totalCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(GameHistory)
            .where(eq(GameHistory.userId, userId))

        return { games: history, total: totalCount[0].count }
    }
    return { games: [], total: 0 }
}

export async function addFavoriteGame(userId: string, gameId: string) {
    await db
        .insert(FavoriteGame)
        .values({ userId, gameId })
        .onConflictDoNothing()
}

export async function removeFavoriteGame(userId: string, gameId: string) {
    await db
        .delete(FavoriteGame)
        .where(
            and(
                eq(FavoriteGame.userId, userId),
                eq(FavoriteGame.gameId, gameId)
            )
        )
}

export async function findFavoriteGames(userId: string): Promise<string[]> {
    const favorites = await db
        .select({ gameId: FavoriteGame.gameId })
        .from(FavoriteGame)
        .where(eq(FavoriteGame.userId, userId))
    return favorites.map((f) => f.gameId)
}

export async function enterGame(
    c: Context,
    user: UserType,
    authSession: AuthSessionType,
    gameId: string,
    token: string
) {
    const game = await db.query.Game.findFirst({ where: eq(Game.id, gameId) })
    if (!game) {
        throw new Error('Game not found')
    }

    // This logic seems to be session-specific and might need adjustment based on your caching strategy.
    // For now, we'll assume a simple session creation.
    const newSession = {
        id: nanoid(),
        authSessionId: authSession.id,
        userId: user.id,
        gameId,
        status: 'ACTIVE' as const,
        createdAt: new Date(),
    }
    console.log(newSession)

    // await db.insert(GameSession).values(newSession)
    SessionManager.startGameSession(c, game.name)

    const gameConfig = {
        authToken: token,
        gameSessionId: newSession.id,
        userId: user.id,
        gameName: game.name.replace('RTG', ''),
        lang: 'en', // Assuming language, adjust as needed
        currency: 'USD', // Assuming currency, adjust as needed
        operator: 'redtiger',
        provider: 'kronos',
        depositUrl: '/wallet/deposit',
        lobbyUrl: '/',
        mode: 'real',
        rgsApiBase: `http://localhost:9999/rpc/spin-data/redtiger/platform`,
        cdn: `https://cdn-eu.cloudedge.info/all/games/slots/${game.name}/`,
        baseCdn: 'https://cdn-eu.cloudedge.info/all/games/',
    }

    return {
        webUrl: '/games/redtiger/loader.html',
        gameConfig,
    }
}

export async function leaveGame(authSessionId: string) {
    // This logic would involve updating the game session status to COMPLETED or ABANDONED
    // and persisting any final data from cache to the database.
    console.log(`Leaving game for auth session: ${authSessionId}`)
}

export async function findGameHistory(userId: string) {
    const records = await db.query.GameHistory.findMany({
        where: eq(GameHistory.userId, userId),
        orderBy: desc(GameHistory.createdAt),
    })

    const totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(GameHistory)
        .where(eq(GameHistory.userId, userId))
    const totalCount = totalCountResult[0].count

    return {
        total_pages: Math.ceil(totalCount / 10),
        record: records,
    }
}
export async function findTopWins() {
    const records = await db.query.Game.findMany({
        orderBy: desc(Game.totalWon),
    })

    const totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(Game)
    // .where(eq(Game.id, userId))
    const totalCount = totalCountResult[0].count

    return {
        total_pages: Math.ceil(totalCount / 10),
        record: records,
    }
}
