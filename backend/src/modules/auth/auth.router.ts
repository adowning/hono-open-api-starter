import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers'
import { createErrorSchema, createMessageObjectSchema, } from 'stoker/openapi/schemas'

import {
    selectAuthSessionSchema,
    selectGameSession,
    selectVipInfoSchema,
    selectWalletSchema,
    userResponseSchema,
} from '#/db/schema'
import { createRouter } from '#/lib/create-app'
import { authMiddleware } from '#/middlewares/auth.middleware'
import { sessionMiddleware } from '#/middlewares/session.middleware'

import { badRequestSchema } from '#/lib/constants'
import * as controller from './auth.controller'

const tags = ['Auth']

export const login = createRoute({
    path: '/auth/login',
    method: 'post',
    request: {
        body: jsonContentRequired(
            // Require password AND at least one identifier (username or uid)
            z.object({
                password: z.string(),
                username: z.string(),
            }),
            // }).and(
            //     z.union([
            //         z.object({ username: z.string(), uid: z.undefined().optional() }),
            //         z.object({ uid: z.string(), username: z.undefined().optional() }),
            //     ]).openapi('LoginRequest')
            // ),
            'User credentials for login: provide password and either username or uid'
        ),
    },
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            userResponseSchema.openapi('User'),
            'The user object and sets an access token cookie.'
        ),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            badRequestSchema,
            'Bad Request',
        ),
        // [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
        //     createErrorSchema(userResponseSchema),
        //     'Invalid id error',
        // ),
    },
})

export const signup = createRoute({
    path: '/auth/signup',
    method: 'post',
    request: {
        body: jsonContentRequired(
            z.object({
                username: z.string(),
                password: z.string(),
            }),
            'User credentials for signup'
        ),
    },
    tags,
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(
            userResponseSchema.openapi('User'),
            'The created user object and sets an access token cookie.'
        ),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            badRequestSchema,
            'Bad Request',
        ),
        // [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
        //     createErrorSchema(insertUserSchema),
        //     'The validation error(s)',
        // ),
    },
})

export const sessionRoute = createRoute({
    method: 'get',
    path: '/auth/me',
    tags,
    summary: 'Get current user session',
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({
                user: userResponseSchema.openapi('User'),
                authSession: selectAuthSessionSchema.openapi('AuthSession'),
                gameSession: selectGameSession.optional().openapi('GameSession'),
                wallet: selectWalletSchema.openapi('Wallet'),
                vipInfo: selectVipInfoSchema.openapi('VipInfo'),
                operator: selectVipInfoSchema.openapi('Operator'),
            }),
            'The current user session'
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            createErrorSchema(userResponseSchema),
            'Invalid id error',
        ),
    },
})

const logoutRoute = createRoute({
    method: 'post',
    path: '/auth/logout',
    tags,
    summary: 'Logout current user',
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            createMessageObjectSchema('Successfully logged out'),
            'Logout successful'
        ),
        401: jsonContent(z.object({ error: z.string() }), 'Unauthorized'),
    },
})

// Issue new 15m access token from a valid refresh cookie; rotates refresh every ~6h
const refreshRoute = createRoute({
    method: 'post',
    path: '/auth/refresh',
    tags,
    summary: 'Mint a new access token using the refresh cookie',
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({ accessToken: z.string() }).openapi('AccessToken'),
            'New access token'
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            z.object({ error: z.string() }).openapi('refreshToken'),
            'Invalid or expired refresh token'
        ),
    },
})

const router = createRouter()

router.openapi(login, controller.login)
router.openapi(signup, controller.signup)

// Refresh uses only cookie, no authMiddleware
router.openapi(refreshRoute, controller.refresh)

router.use('/auth/logout', authMiddleware)
router.openapi(logoutRoute, controller.logout)

router.use('/auth/me', authMiddleware, sessionMiddleware)
router.openapi(sessionRoute, controller.session)

export default router

export type LoginRoute = typeof login
export type SignUpRoute = typeof signup
export type SessionRoute = typeof sessionRoute
export type RefreshRoute = typeof refreshRoute
