import type { Context, Next } from 'hono'
import chalk from 'chalk'
import { and, eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'
import * as jose from 'jose'

import db from '#/db'
import { AuthSession, User, VipInfo, Wallet } from '#/db/schema'
import env from '#/env'

export async function authMiddleware(c: Context, next: Next) {
    console.log(chalk.green('Auth middleware called'))
    let token: string | undefined
    console.log(c.req.url)
    if (c.req.url.includes('/updates/check')) {
        return next()
    } else {
        // 1. Check for Bearer token in the Authorization header
        const authHeader = c.req.header('Authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7)
        }

        // 2. Fallback to checking for the cookie
        if (!token) {
            token = getCookie(c, 'access_token')
        }

        if (!token) {
            return c.json({ error: 'Unauthorized' }, 401)
        }

        try {
            const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)
            const { payload } = await jose.jwtVerify(token, secret, {
                algorithms: ['HS256'],
                maxTokenAge: '7 days',
            })
            if (!payload || !payload.userId || !payload.sessionId) {
                return c.json({ error: 'Invalid token' }, 401)
            }

            const authSession = await db.query.AuthSession.findFirst({
                where: and(
                    eq(AuthSession.id, payload.sessionId as string),
                    eq(AuthSession.status, 'ACTIVE')
                ),
            })

            if (!authSession) {
                return c.json(
                    { error: 'Session not found or has expired' },
                    401
                )
            }

            const user = await db.query.User.findFirst({
                where: eq(User.id, payload.userId as string),
            })

            if (!user) {
                return c.json({ error: 'User not found' }, 401)
            }

            if (!user.activeWalletId) {
                return c.json(
                    { error: 'activeWalletId not found on user' },
                    401
                )
            }

            const activeWallet = await db.query.Wallet.findFirst({
                where: eq(Wallet.id, user.activeWalletId),
            })

            if (!activeWallet) {
                return c.json(
                    { error: 'activeWallet not found or has expired' },
                    401
                )
            }

            // Get the operator separately since we can't use with clause directly
            const operator = await db.query.Operator.findFirst({
                where: (operators) => eq(operators.id, activeWallet.operatorId),
            })

            if (!operator) {
                return c.json({ error: 'Operator not found for wallet' }, 401)
            }

            if (!user.vipInfoId) {
                return c.json({ error: 'vipInfoId not found on user' }, 401)
            }

            const vipInfo = await db.query.VipInfo.findFirst({
                where: eq(VipInfo.id, user.vipInfoId),
            })

            c.set('vipInfo', vipInfo)
            c.set('operator', operator)
            c.set('wallet', activeWallet)
            c.set('token', token)
            c.set('authSession', authSession)
            c.set('user', user)
            return next()
        } catch (e) {
            console.log(e)
            return c.json({ error: 'Invalid token' }, 401)
        }
    }
}
