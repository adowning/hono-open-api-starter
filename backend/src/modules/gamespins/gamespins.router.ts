import { gameSpinResponseSchema } from '#/db'
import { notFoundSchema } from '#/lib/constants'
import { createRouter } from '#/lib/create-app'
import { authMiddleware } from '#/middlewares/auth.middleware'
import { createRoute } from '@hono/zod-openapi'
import * as controller from './gamespins.controller'
import { z } from 'zod'

const tags = ['Game Spins']

const getTopWins = createRoute({
    method: 'get',
    path: '/gamespins/topwins',
    middleware: [authMiddleware],
    tags,
    responses: {
        200: {
            description: 'A list of top winning game spins',
            content: {
                'application/json': {
                    schema: z.array(gameSpinResponseSchema.openapi('GameSpin')),
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

// const router = createRouter()

// router.use('/gamespins/*', sessionMiddleware)
// router.use('/gamespins/*', authMiddleware)

// router.openapi(getTopWins, async (c) => {
//     const spins = await controller.getTopWins(10)
//     return c.json(spins, HttpStatusCodes.OK)
// })

// export default router
const router = createRouter()
    .openapi(getTopWins, controller.getTopWins as any)

export default router
