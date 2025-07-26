import type { Context } from 'hono'
import type { AuthSessionType, UserType } from '#/db/schema'

import * as service from './games.service'

export async function getGameCategories(c: Context) {
    const data = service.findGameCategories()
    return c.json(data)
}

export async function getAllGames(c: Context) {
    console.log('here')
    const data = await service.findAllGames()
    return c.json(data)
}

export async function searchGames(c: Context) {
    const { game_categories_slug, page, limit } = c.req.query()
    const data = await service.searchGames({
        game_categories_slug,
        page: page ? Number.parseInt(page) : 1,
        limit: limit ? Number.parseInt(limit) : 10,
    })
    return c.json(data)
}

export async function getUserGames(c: Context) {
    const { game_categories_slug, page, limit } = c.req.query()
    const user = c.get('user') as UserType
    const data = await service.findUserGames(user.id, {
        game_categories_slug,
        page: page ? Number.parseInt(page) : 1,
        limit: limit ? Number.parseInt(limit) : 10,
    })
    return c.json(data)
}

export async function favoriteGame(c: Context) {
    const user = c.get('user') as UserType
    const { add_game, del_game } = await c.req.json()
    if (add_game) {
        await service.addFavoriteGame(user.id, add_game)
    } else if (del_game) {
        await service.removeFavoriteGame(user.id, del_game)
    }
    return c.json({ message: 'Success' })
}

export async function getFavoriteGames(c: Context) {
    const user = c.get('user') as UserType
    const data = await service.findFavoriteGames(user.id)
    return c.json(data)
}

export async function enterGame(c: Context) {
    const user = c.get('user') as UserType
    const authSession = c.get('authSession') as AuthSessionType
    const token = c.get('token') as string
    const gameId = c.req.param('id')

    const data = await service.enterGame(c, user, authSession, gameId, token)
    return c.json(data)
}

export async function leaveGame(c: Context) {
    const authSession = c.get('authSession') as AuthSessionType
    await service.leaveGame(authSession.id)
    return c.json({ message: 'Success' })
}

export async function getGameHistory(c: Context) {
    const user = c.get('user') as UserType
    const data = await service.findGameHistory(user.id)
    return c.json(data)
}
export async function topWins(c: Context) {
    const data = await service.findTopWins()
    return c.json(data)
}
