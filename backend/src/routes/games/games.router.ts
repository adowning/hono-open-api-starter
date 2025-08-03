import { gameResponseSchema } from '#/db/schema'
import { notFoundSchema } from '#/lib/constants'
import { createRouter } from '#/lib/create-app'
import { authMiddleware } from '#/middlewares/auth.middleware'
import { sessionMiddleware } from '#/middlewares/session.middleware'
import { createRoute, z } from '@hono/zod-openapi'

import * as controller from './games.controller'

const tags = ['Games']

const getGameCategories = createRoute({
    method: 'get',
    path: '/games/categories',
    tags,
    responses: {
        200: {
            description: 'A list of game categories',
            content: {
                'application/json': {
                    schema: z.array(z.string()),
                },
            },
        },
    },
})

const getAllGames = createRoute({
    method: 'get',
    path: '/games/all',
    tags,
    responses: {
        200: {
            description: 'A list of all games',
            content: {
                'application/json': {
                    schema: z.array(gameResponseSchema.openapi('Game')),
                },
            },
        },
    },
})

const searchGames = createRoute({
    method: 'get',
    path: '/games/search',
    tags,
    request: {
        query: z.object({
            game_categories_slug: z.string().optional(),
            page: z.string().optional(),
            limit: z.string().optional(),
        }),
    },
    responses: {
        200: {
            description: 'A list of games matching the search criteria',
            content: {
                'application/json': {
                    schema: z.object({
                        games: z.array(gameResponseSchema),
                        total: z.number(),
                    }),
                },
            },
        },
    },
})

const getUserGames = createRoute({
    method: 'get',
    path: '/user/games',
    tags,
    request: {
        query: z.object({
            game_categories_slug: z.string(),
            page: z.string().optional(),
            limit: z.string().optional(),
        }),
    },
    responses: {
        200: {
            description:
                'A list of games for the current user (e.g., favorites or history)',
            content: {
                'application/json': {
                    schema: z.object({
                        games: z.array(gameResponseSchema), // This might need to be adjusted for history
                        total: z.number(),
                    }),
                },
            },
        },
    },
})

const favoriteGame = createRoute({
    method: 'post',
    path: '/user/games/favorite',
    tags,
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        add_game: z.string().optional(),
                        del_game: z.string().optional(),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Success',
        },
    },
})

const getFavoriteGames = createRoute({
    method: 'get',
    path: '/user/games/favorites',
    tags,
    responses: {
        200: {
            description: 'A list of the user favorite game IDs',
            content: {
                'application/json': {
                    schema: z.array(z.string()),
                },
            },
        },
    },
})

const enterGame = createRoute({
    method: 'post',
    path: '/games/{id}/enter',
    middleware: [authMiddleware, sessionMiddleware],

    tags,
    request: {
        params: z.object({
            id: z.string(),
        }),
    },
    responses: {
        200: {
            description: 'Game session details',
            content: {
                'application/json': {
                    schema: z.object({
                        webUrl: z.string(),
                        gameConfig: z.object({
                            authToken: z.string(),
                            gameSessionId: z.string(),
                            userId: z.string(),
                            gameName: z.string(),
                            lang: z.string(),
                            currency: z.string(),
                            operator: z.string(),
                            provider: z.string(),
                            depositUrl: z.string(),
                            lobbyUrl: z.string(),
                            mode: z.string(),
                            rgsApiBase: z.string(),
                            cdn: z.string(),
                            baseCdn: z.string(),
                        }),
                    }),
                },
            },
        },
        404: {
            description: 'Not Found',
            content: {
                'application/json': {
                    schema: notFoundSchema,
                },
            },
        },
    },
})

const leaveGame = createRoute({
    method: 'post',
    path: '/games/leave',
    middleware: [authMiddleware, sessionMiddleware],
    tags,
    responses: {
        200: {
            description: 'Success',
        },
    },
})

const router = createRouter()

// Public routes - no authentication or session required
router.openapi(getAllGames, controller.getAllGames as any)
router.openapi(getGameCategories, controller.getGameCategories as any)

// Routes that require authentication but not a game session
router.openapi(searchGames, controller.searchGames as any)
router.openapi(getUserGames, controller.getUserGames as any)
router.openapi(favoriteGame, controller.favoriteGame)
router.openapi(getFavoriteGames, controller.getFavoriteGames as any)

// Routes that require both authentication and a game session
router.openapi(enterGame, controller.enterGame as any)
router.openapi(leaveGame, controller.leaveGame)

export default router
