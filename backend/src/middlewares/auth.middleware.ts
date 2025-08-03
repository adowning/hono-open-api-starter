import chalk from 'chalk'
import { and, eq } from 'drizzle-orm'
import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import * as jose from 'jose'

import db from '#/db'
import { authSessions, users } from '#/db/schema'
import env from '#/env'

/**
 * Extract a bearer token from Authorization header or from cookie `access_token`.
 * Normalizes quotes and URL-encoding and ensures a compact JWS (three segments).
 */
function extractToken(c: Context): string | null {
    // Authorization header (case-insensitive)
    const rawAuth = c.req.header('authorization') ?? c.req.header('Authorization')
    if (rawAuth && typeof rawAuth === 'string') {
        const parts = rawAuth.trim().split(/\s+/)
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
            let t = parts[1].trim().replace(/^"(.+)"$/, '$1')
            try {
                // In case the token was URL-encoded in transit
                t = decodeURIComponent(t)
            } catch {
                // ignore decode errors and use raw token
            }
            if (isCompactJws(t)) return t
        }
    }

    // Cookie fallback
    const cookieToken = getCookie(c, 'access_token')
    if (cookieToken && typeof cookieToken === 'string') {
        let t = cookieToken.trim().replace(/^"(.+)"$/, '$1')
        try {
            t = decodeURIComponent(t)
        } catch {
            // ignore
        }
        if (isCompactJws(t)) return t
        // If cookie exists but malformed, still return raw so we can respond Unauthorized consistently
        return t
    }

    return null
}

/**
 * Checks that the token is a compact JWS (header.payload.signature).
 */
function isCompactJws(token: string | undefined | null): boolean {
    if (!token || typeof token !== 'string') return false
    const parts = token.split('.')
    return parts.length === 3 && parts.every(p => p.length > 0)
}

export async function authMiddleware(c: Context, next: Next) {
    console.log(chalk.green('--- Auth middleware begin ---'))

    if (c.req.url.includes('/updates/check')) {
        return next()
    }

    const token = extractToken(c)

    if (!isCompactJws(token)) {
        // Log minimal sanitized preview for debugging, avoid leaking full token
        const preview = token ? `${String(token).slice(0, 16)}...` : 'null'
        console.warn(chalk.yellow(`Invalid token format received: ${preview}`))
        return c.json({ error: 'Unauthorized' }, 401)
    }

    try {
        const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)
        const { payload } = await jose.jwtVerify(token as string, secret, {
            algorithms: ['HS256'],
        })

        if (!payload || !payload.userId || !payload.sessionId) {
            return c.json({ error: 'Invalid token' }, 401)
        }
        console.log(payload.sessionId)
        const authSession = await db.query.authSessions.findFirst({
            where: and(
                eq(authSessions.id, payload.sessionId as string),
                eq(authSessions.status, 'ACTIVE')
            ),
        })
        console.log(authSession)

        if (!authSession) {
            return c.json({ error: 'Session not found or has expired' }, 401)
        }

        const userId = payload.userId as string
        const [user] = await db
            .update(users)
            .set({
                lastSeen: new Date().toISOString(),
                currentAuthSessionDataId: authSession.id,
            })
            .where(eq(users.id, userId))
            .returning({ id: users.id })

        if (!user) {
            return c.json({ error: 'User not found' }, 401)
        }

        const userWithRelations = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            with: {
                vipInfo: true,
                activeWallet: {
                    with: {
                        operator: true,
                    },
                },
            },
        })

        if (
            !userWithRelations ||
            !userWithRelations.activeWalletId ||
            !userWithRelations.vipInfoId ||
            !userWithRelations.activeWallet?.operator
        ) {
            return c.json({ error: 'User account is not fully configured.' }, 401)
        }

        c.set('vipInfo', userWithRelations.vipInfo)
        c.set('wallet', userWithRelations)
        c.set('operator', userWithRelations.activeWallet.operator)
        c.set('token', token as string)
        c.set('authSession', authSession)
        c.set('user', userWithRelations)

        console.log(chalk.green('--- Auth middleware end ---'))
        return next()
    } catch (e) {
        // Avoid leaking jose error details to client
        const msg = e instanceof Error ? e.message : String(e)
        console.error(chalk.red(`JWT verify failed: ${msg}`))
        return c.json({ error: 'Invalid token' }, 401)
    }
}
