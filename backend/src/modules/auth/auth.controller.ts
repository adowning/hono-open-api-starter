import type { Context } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import * as HttpStatusPhrases from 'stoker/http-status-phrases'

import db from '#/db'
import type { Newusers, UserType } from '#/db/schema'
import { userResponseSchema, authSessions } from '#/db/schema'
import { users } from '#/db/schema/schema'
import env from '#/env'
import { SessionManager } from '#/lib/session.manager'
import type { AppRouteHandler } from '#/lib/types'
import { and, eq } from 'drizzle-orm'
import * as jose from 'jose'
import * as HttpStatusCodes from 'stoker/http-status-codes'
import type { LoginRoute, SessionRoute, SignUpRoute } from './auth.router'
import * as service from './auth.service'

const ACCESS_TOKEN_EXPIRES_IN = '15m'
const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7 // 7 days
const ROTATION_WINDOW_SECONDS = 60 * 60 * 6 // 6 hours

/**
 * Resolve cookie domain dynamically so environments like localhost do not
 * incorrectly set Domain=.cashflowcasino.com and production never sets localhost.
 * - For production hosts ending in .cashflowcasino.com -> return '.cashflowcasino.com'
 * - For other hosts (localhost, IPs) -> return undefined to omit Domain attribute
 */
function resolveCookieDomain(host: string | undefined): string | undefined {
    if (!host) return undefined
    // Strip port if any
    const bare = host.split(':')[0].toLowerCase()
    if (bare.endsWith('.cashflowcasino.com')) return '.cashflowcasino.com'
    if (bare === 'cashflowcasino.com') return '.cashflowcasino.com'
    return undefined
}

/**
 * Issuer should match the API hostname in production. For validation we only check
 * that the refresh token issuer equals this string. Keeping as constant for now.
 */
const ISSUER = 'api.cashflowcasino.com'
const AUDIENCE = 'web'

export const login: AppRouteHandler<LoginRoute> = async (c) => {
    const { username, password, uid } = c.req.valid('json')

    // Require password AND at least one identifier (username or uid)
    if (!password || (!username && !uid)) {
        return c.json(
            { message: HttpStatusPhrases.BAD_REQUEST },
            HttpStatusCodes.BAD_REQUEST
        )
    }

    let userRecord: UserType | undefined
    try {
        if (username) {
            userRecord = await db.query.users.findFirst({
                where: eq(users.username, username),
            })
        } else if (uid) {
            userRecord = await db.query.users.findFirst({
                where: eq(users.id, uid),
            })
        }
    } catch (error) {
        console.error('Error querying user:', error)
        return c.json(
            { message: HttpStatusPhrases.BAD_REQUEST },
            HttpStatusCodes.BAD_REQUEST
        )
    }

    if (!userRecord?.passwordHash) {
        return c.json(
            { message: HttpStatusPhrases.BAD_REQUEST },
            HttpStatusCodes.BAD_REQUEST
        )
    }

    const isPasswordValid = await Bun.password.verify(
        password,
        userRecord.passwordHash
    )
    if (!isPasswordValid) {
        return c.json(
            { message: HttpStatusPhrases.BAD_REQUEST },
            HttpStatusCodes.BAD_REQUEST
        )
    }

    const authSession = await SessionManager.startAuthSession(userRecord)

    const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)

    // Issue 15-minute access token (header-only usage)
    const accessToken = await new jose.SignJWT({
        userId: userRecord.id,
        sessionId: authSession.id,
        aud: AUDIENCE,
        iss: ISSUER,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
        .sign(secret)

    // Issue 7-day refresh token as JWT; reuse ACCESS_TOKEN_SECRET for now (as requested)
    // Include a unique jti for rotation tracking
    const refreshToken = await new jose.SignJWT({
        sub: userRecord.id,
        sid: authSession.id,
        aud: AUDIENCE,
        iss: ISSUER,
        typ: 'refresh',
        jti: crypto.randomUUID(),
        rti: Math.floor(Date.now() / 1000), // rotationIssuedAt (unix)
        rwn: ROTATION_WINDOW_SECONDS, // rotation window seconds (6h)
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${REFRESH_TOKEN_EXPIRES_IN_SECONDS}s`)
        .sign(secret)

    // Set refresh_token cookie with a strict production domain override.
    // Some edge/proxies rewrite the Host header to localhost on origin.
    // Since you confirmed you are on app.cashflowcasino.com hitting api.cashflowcasino.com,
    // force Domain=.cashflowcasino.com unconditionally in production to avoid localhost scoping.
    setCookie(c, 'refresh_token', refreshToken, {
        domain: '.cashflowcasino.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    })

    // Return user plus BOTH tokens so clients without third‑party cookies can persist refresh via Authorization
    return c.json({ ...userRecord, accessToken, refreshToken } as any, HttpStatusCodes.OK)
}

export const signup: AppRouteHandler<SignUpRoute> = async (c) => {
    console.log('ere')
    const { username, password } = await c.req.json<{
        username?: string
        password?: string
    }>()
    console.log(username, password)
    if (!username || !password) {
        // return c.json({ error: 'Username and password are required.' }, 400)
        return c.json(
            {
                message: 'no username or password',
            },
            HttpStatusCodes.BAD_REQUEST
        )
    }

    // const result = await service.signup(username, password)
    const user: UserType | undefined | null = await db.transaction(async (tx) => {
        const passwordHash = await Bun.password.hash(password, 'bcrypt')

        const existingUser = await tx.query.users.findFirst({
            where: eq(users.username, username),
        })

        if (existingUser) {
            // return c.json(
            //     {
            //         message: HttpStatusPhrases.BAD_REQUEST,
            //     },
            //     HttpStatusCodes.BAD_REQUEST
            // )
            return null
        }

        const newUserValues: Newusers = {
            username,
            passwordHash,
            totalXpGained: 0,
            id: ''
        }

        const newUser = await tx
            .insert(users)
            .values(newUserValues)
            .returning()

        return await db.query.users.findFirst({ where: eq(users.id, newUser[0].id) })
    })
    if (!user) {
        return c.json(
            {
                message: HttpStatusPhrases.BAD_REQUEST,
            },
            HttpStatusCodes.BAD_REQUEST
        )
    }
    const authSession = await SessionManager.startAuthSession(user)

    const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)

    // 15-minute access token (header-only)
    const accessToken = await new jose.SignJWT({
        userId: user.id,
        sessionId: authSession.id,
        aud: AUDIENCE,
        iss: ISSUER,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
        .sign(secret)

    // 7-day refresh token JWT with rotation metadata
    const refreshToken = await new jose.SignJWT({
        sub: user.id,
        sid: authSession.id,
        aud: AUDIENCE,
        iss: ISSUER,
        typ: 'refresh',
        jti: crypto.randomUUID(),
        rti: Math.floor(Date.now() / 1000),
        rwn: ROTATION_WINDOW_SECONDS,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${REFRESH_TOKEN_EXPIRES_IN_SECONDS}s`)
        .sign(secret)

    // Set httpOnly cookie cross-subdomain (prod) or host-only (dev)
    const reqHost2 = c.req.header('Host') || c.req.url.split('/')[2] || ''
    const cookieDomain2 = resolveCookieDomain(reqHost2)
    setCookie(c, 'refresh_token', refreshToken, {
        domain: cookieDomain2,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
    })

    // Return user plus BOTH tokens so clients without third‑party cookies can persist refresh via Authorization
    return c.json({ ...user, accessToken, refreshToken } as any, HttpStatusCodes.CREATED)
}

// export async function session(c: Context): Promise<any> {
export const session: AppRouteHandler<SessionRoute> = async (c) => {
    const user = c.get('user')
    const authSession = c.get('authSession')
    const gameSession = c.get('gameSession')
    const wallet = c.get('wallet')
    const vipInfo = c.get('vipInfo')
    const operator = c.get('operator')

    // Normalize Date objects to strings to satisfy zod schemas expecting strings
    const normalizeDate = (v: unknown) => {
        if (v instanceof Date) return v.toISOString()
        return v
    }

    const normalizedUser = user
        ? {
                ...user,
                createdAt: normalizeDate((user as any).createdAt),
                updatedAt: normalizeDate((user as any).updatedAt),
                lastSeen: normalizeDate((user as any).lastSeen),
            }
        : user

    const normalizedWallet =
        wallet && typeof wallet === 'object'
            ? {
                    ...wallet,
                    createdAt: normalizeDate((wallet as any).createdAt),
                    updatedAt: normalizeDate((wallet as any).updatedAt),
                }
            : wallet

    const normalizedVip =
        vipInfo && typeof vipInfo === 'object'
            ? {
                    ...vipInfo,
                    createdAt: normalizeDate((vipInfo as any).createdAt),
                    updatedAt: normalizeDate((vipInfo as any).updatedAt),
                }
            : vipInfo

    const payload = {
        user: userResponseSchema.parse(normalizedUser),
        authSession,
        gameSession,
        wallet: normalizedWallet,
        vipInfo: normalizedVip,
        operator,
    }

    return c.json(payload, HttpStatusCodes.OK)
}

export async function logout(c: Context): Promise<any> {
    const authSession = c.get('authSession')
    const user = c.get('user')
    await service.logout(authSession, user.id)

    // Clear refresh cookie for prod domain and host-only for safety
    setCookie(c, 'refresh_token', '', {
        domain: '.cashflowcasino.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        expires: new Date(0),
    })
    setCookie(c, 'refresh_token', '', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        expires: new Date(0),
    })

    return c.json({ message: 'Successfully logged out' })
}

/**
 * POST /auth/refresh
 * Verify refresh_token cookie, optionally rotate if older than ROTATION_WINDOW_SECONDS,
 * and return a new 15m access token.
 */
export async function refresh(c: Context) {
    try {
        const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)

        // Accept refresh token from either cookie or Authorization header fallback for early clients
        let cookie = getCookie(c, 'refresh_token')
        if (!cookie) {
            const rawAuth = c.req.header('authorization') ?? c.req.header('Authorization')
            if (rawAuth && typeof rawAuth === 'string') {
                const parts = rawAuth.trim().split(/\s+/)
                if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
                    cookie = parts[1]
                }
            }
        }
        if (!cookie) {
            return c.json({ error: 'Missing refresh token' }, HttpStatusCodes.UNAUTHORIZED)
        }

        let payload: jose.JWTPayload
        try {
            const verified = await jose.jwtVerify(cookie, secret, {
                algorithms: ['HS256'],
                issuer: ISSUER,
                audience: AUDIENCE,
            })
            payload = verified.payload
        } catch {
            return c.json({ error: 'Invalid refresh token' }, HttpStatusCodes.UNAUTHORIZED)
        }

        const sub = payload.sub as string | undefined
        const sid = (payload as any).sid as string | undefined
        const jti = (payload as any).jti as string | undefined
        const rti = Number((payload as any).rti) || 0

        if (!sub || !sid || !jti) {
            return c.json({ error: 'Malformed refresh token' }, HttpStatusCodes.UNAUTHORIZED)
        }

        // Session must be ACTIVE
        const session = await db.query.authSessions.findFirst({
            where: and(eq(authSessions.id, sid), eq(authSessions.status, 'ACTIVE')),
        })
        if (!session) {
            return c.json({ error: 'Session not active' }, HttpStatusCodes.UNAUTHORIZED)
        }

        const nowSec = Math.floor(Date.now() / 1000)
        const ageSec = nowSec - rti

        // Always mint a fresh access token (15m)
        const accessToken = await new jose.SignJWT({
            userId: sub,
            sessionId: sid,
            aud: AUDIENCE,
            iss: ISSUER,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
            .sign(secret)

        // Rotate refresh token if older than rotation window
        if (ageSec >= ROTATION_WINDOW_SECONDS) {
            const newJti = crypto.randomUUID()
            const newRefreshToken = await new jose.SignJWT({
                sub,
                sid,
                aud: AUDIENCE,
                iss: ISSUER,
                typ: 'refresh',
                jti: newJti,
                rti: nowSec,
                rwn: ROTATION_WINDOW_SECONDS,
                prv: jti,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime(`${REFRESH_TOKEN_EXPIRES_IN_SECONDS}s`)
                .sign(secret)

            // Force production domain for rotation as well
            setCookie(c, 'refresh_token', newRefreshToken, {
                domain: '.cashflowcasino.com',
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: REFRESH_TOKEN_EXPIRES_IN_SECONDS,
            })
        }

        return c.json({ accessToken }, HttpStatusCodes.OK)
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return c.json({ error: msg }, HttpStatusCodes.UNAUTHORIZED)
    }
}
