import type { Context } from 'hono'

import { setCookie } from 'hono/cookie'

import env from '#/env'

import * as service from './auth.service'

export async function login(c: Context) {
    const { username, password, uid } = await c.req.json()
    const result = await service.login(
        username,
        password,
        uid
    )
    if ('error' in result) {
        return c.json({ error: result.error }, 401)
    }
    const { accessToken, refreshToken, user } = result
    setCookie(c, 'access_token', accessToken, {
        path: '/',
        domain: 'localhost:9999',
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 60 * 15, // 15 minutes
    })
    console.log(accessToken)
    return c.json({ accessToken, refreshToken, user })
}

export async function signup(c: Context) {
    const { username, password } = await c.req.json()
    const result = await service.signup(
        username,
        password
    )
    if ('error' in result) {
        return c.json({ error: result.error }, 401)
    }
    const { accessToken, refreshToken, user } = result
    return c.json({ accessToken, refreshToken, user })
}

export async function session(c: Context) {
    const user = c.get('user')
    const authSession = c.get('authSession')
    const gameSession = c.get('gameSession')
    const wallet = c.get('wallet')
    const vipInfo = c.get('vipInfo')
    const operator = c.get('operator')

    return c.json({
        user: {
            ...user,
            passwordHash: undefined,
        },
        authSession,
        gameSession,
        wallet,
        vipInfo,
        operator,
    })
}

export async function logout(c: Context) {
    const authSession = c.get('authSession')
    const user = c.get('user')
    if (authSession) {
        await service.logout(authSession.id, user.id)
    }

    setCookie(c, 'access_token', '', {
        path: '/',
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'Lax',
        expires: new Date(0),
    })

    return c.json({ message: 'Successfully logged out' }, 200)
}
