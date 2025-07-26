import { createRoute, z } from '@hono/zod-openapi'

import {
    selectVipLevelSchema,
    selectVipRankSchema,
    VipInfoResponseSchema,
} from '#/db'
import { createRouter } from '#/lib/create-app'
import { authMiddleware } from '#/middlewares/auth.middleware'

import * as controller from './vip.controller'

const tags = ['VIP']

// ---  Definitions ---
const getMyVipDetails = createRoute({
    method: 'get',
    path: '/vip/me',
    tags,
    summary: 'Get the authenticated user VIP details',
    responses: {
        200: {
            description:
                'Returns the users VIP information, rank, and progress.',
            content: {
                'application/json': {
                    schema: z
                        .object({
                            vipInfo: VipInfoResponseSchema.openapi('VipInfo'),
                            vipRank: selectVipRankSchema.openapi('VipRank'),
                            xpForNextLevel: z.number(),
                        })
                        .openapi('VipDetails'),
                },
            },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'VIP Info not found' },
    },
})

const getVipLevels = createRoute({
    method: 'get',
    path: '/vip/levels',
    tags,
    summary: 'Get the configuration for all VIP levels',
    responses: {
        200: {
            description: 'Returns the VIP level configuration table.',
            content: {
                'application/json': {
                    schema: z.array(selectVipLevelSchema.openapi('VipLevel')),
                },
            },
        },
    },
})

const getVipRanks = createRoute({
    method: 'get',
    path: '/vip/ranks',
    tags,
    summary: 'Get the configuration for all VIP ranks',
    responses: {
        200: {
            description: 'Returns the VIP rank configuration table.',
            content: {
                'application/json': {
                    schema: z.array(selectVipRankSchema.openapi('VipRank')),
                },
            },
        },
    },
})

const router = createRouter()

// All VIP routes require authentication
router.use('/vip/*', authMiddleware)

router.openapi(getMyVipDetails, controller.getMyVipDetails as any)
router.openapi(getVipLevels, controller.getVipLevels as any)
router.openapi(getVipRanks, controller.getVipRanks as any)

export default router
