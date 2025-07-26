import { createRoute } from '@hono/zod-openapi'
import { notFoundSchema } from '#/lib/constants'
import { createRouter } from '#/lib/create-app'
import { authMiddleware } from '#/middlewares/auth.middleware'
import { sessionMiddleware } from '#/middlewares/session.middleware'
import { StatusCodes as HttpStatusCodes } from 'http-status-codes'
import * as controller from './gamespins.controller'

const tags = ['Game Spins']

const getTopWins = createRoute({
    method: 'get',
    path: '/gamespins/topwins',
    tags,
    responses: {
        200: {
            description: 'A list of top winning game spins',
            content: {
                'application/json': {
                    schema: controller.GameSpinListResponseSchema,
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': {
                    schema: notFoundSchema,
                },
            },
        },
    },
})

const router = createRouter()

router.use('/gamespins/*', sessionMiddleware)
router.use('/gamespins/*', authMiddleware)

router.openapi(getTopWins, async (c) => {
    const spins = await controller.getTopWins(10)
    return c.json(spins, HttpStatusCodes.OK)
})

export default router
