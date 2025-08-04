import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
// import { createErrorSchema } from 'stoker/openapi/schemas'

import { createRouter } from '#/lib/create-app'
import { authMiddleware } from '#/middlewares/auth.middleware'
import { selectWalletSchema } from '#/db/schema'
import { getMyWallet, getWalletHistory, postSwitchOperator, } from './wallet.service'

const tags = ['Wallets']

export const getMyWalletRoute = createRoute({
    method: 'get',
    path: '/wallets/me',
    tags,
    summary: 'Get the active wallet for the authenticated user',
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                wallet: selectWalletSchema.nullable(),
            }),
            'Active wallet summary or null if none is active'
        ),
        // Add error variants so handler types can union to them without violating the typed response
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            z.object({ error: z.string() }),
            'User not found'
        ),
    },
})

export const getWalletHistoryRoute = createRoute({
    method: 'get',
    path: '/wallets/history',
    tags,
    summary: 'List all wallets for the authenticated user',
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                wallets: z.array(selectWalletSchema),
            }),
            'All wallets for the authenticated user'
        ),
    },
})

export const postSwitchOperatorRoute = createRoute({
    method: 'post',
    path: '/wallets/switch-operator',
    tags,
    summary: 'Switch the active wallet to the given operator, creating if needed',
    request: {
        body: jsonContentRequired(
            // Inline schema here to avoid import/type resolution issues
            z.object({
                operatorId: z.string(),
                idempotencyKey: z.string().optional(),
            }),
            'Target operator to switch the active wallet to'
        ),
    },
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                wallet: selectWalletSchema,
            }),
            'The newly activated wallet'
        ),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            z.object({ error: z.string() }),
            'Invalid request body'
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            z.object({ error: z.string() }),
            'Unauthorized'
        ),
    },
})

const router = createRouter()

// Require auth for all wallet endpoints
router.use('/wallets/*', authMiddleware)

router.openapi(getMyWalletRoute, getMyWallet)
router.openapi(getWalletHistoryRoute, getWalletHistory)
router.openapi(postSwitchOperatorRoute, postSwitchOperator)

export default router

export type GetMyWalletRoute = typeof getMyWalletRoute
export type GetWalletHistoryRoute = typeof getWalletHistoryRoute
export type PostSwitchOperatorRoute = typeof postSwitchOperatorRoute