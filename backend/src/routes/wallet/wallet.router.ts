import { createRoute } from '@hono/zod-openapi'

import { walletResponseSchema } from '#/db'
import { createRouter } from '#/lib/create-app'
import { authMiddleware } from '#/middlewares/auth.middleware'
import { sessionMiddleware } from '#/middlewares/session.middleware'

import * as controller from './wallet.controller'

const tags = ['Wallet']

// All wallet routes should be protected
const updateBalanceRoute = createRoute({
    method: 'post',
    path: '/balance',
    tags,
    middleware: [authMiddleware, sessionMiddleware],
    summary: 'Update current user balance',

    responses: {
        200: {
            description: 'Returns the user wallet balance.',
            content: {
                'application/json': {
                    schema: walletResponseSchema,
                },
            },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Wallet Info not found' },
    },
})

// export default router;
const router = createRouter().openapi(
    updateBalanceRoute,
    controller.handleUpdateBalance as any
)

export default router
