/* eslint-disable ts/ban-ts-comment */

import { eq } from 'drizzle-orm'
import * as jose from 'jose'

import db from '#/db'
import { insertUserSchema, User } from '#/db/schema'
import type { AuthSessionType } from '#/db/schema'
import env from '#/env'
import { SessionManager } from '#/lib/session.manager'
import type { Context } from 'hono'

const ACCESS_TOKEN_EXPIRES_IN = '7 days'
const REFRESH_TOKEN_EXPIRES_IN = '7 days'

export async function login(
    c: Context,
    username: string,
    password: string,
    uid?: string
) {
    if (!username && !uid) {
        return {
            error: 'Username or UID is required',
        }
    }

    let userRecord
    try {
        if (username) {
            const result = await db
                .select()
                .from(User)
                .where(eq(User.username, username))
                .limit(1)
            userRecord = result[0]
        } else if (uid) {
            const result = await db
                .select()
                .from(User)
                .where(eq(User.id, uid))
                .limit(1)
            userRecord = result[0]
        }
    } catch (error) {
        console.error('Error querying user:', error)
        return { error: 'Failed to query user' }
        // throw new Error('Failed to query user')
    }
    if (!userRecord || !userRecord.passwordHash) {
        return { error: 'Invalid creds' }
        // return c.json({ error: 'Invalid creds' }, 401)
    }
    const isPasswordValid = await Bun.password.verify(
        password,
        userRecord.passwordHash
    )

    if (!isPasswordValid) {
        return { error: 'Invalid creds' }
        // throw new Error('Invalid credentials - password')
    }

    // End all previous sessions for this user before creating a new one.
    await SessionManager.endAllUserSessions(userRecord.id)

    // Use the SessionManager to start the new auth session
    const authSession = await SessionManager.startAuthSession(userRecord.id)

    const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)
    const accessToken = await new jose.SignJWT({
        userId: userRecord.id,
        sessionId: authSession.id,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
        .sign(secret)

    const refreshToken = await new jose.SignJWT({
        userId: userRecord.id,
        sessionId: authSession.id,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
        .sign(secret)

    userRecord.passwordHash = null
    const user = userRecord

    return { accessToken, refreshToken, user }
}

export async function logout(authSession: AuthSessionType, userId: string) {
    // Use the SessionManager to end the auth session, which also handles the game session.
    await SessionManager.endAuthSession(authSession.id, userId)
}

export async function signup(username: string, password: string) {
    const passwordHash = await Bun.password.hash(password, 'bcrypt')

    const result = await db.transaction(async (tx) => {
        const existingUser = await tx.query.User.findFirst({
            where: eq(User.username, username),
        })

        if (existingUser) {
            tx.rollback()
            throw new Error('User with this username already exists')
        }

        const newUserValues = insertUserSchema.parse({
            username,
            passwordHash,
        })

        const [newUser] = await tx
            .insert(User)
            // @ts-ignore
            .values(newUserValues)
            .returning()
        return { user: newUser }
    })

    const { user } = result

    const authSession = await SessionManager.startAuthSession(user.id)

    const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)
    const accessToken = await new jose.SignJWT({
        userId: user.id,
        sessionId: authSession.id,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
        .sign(secret)

    const refreshToken = await new jose.SignJWT({
        userId: user.id,
        sessionId: authSession.id,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
        .sign(secret)

    return { accessToken, refreshToken, user }
}
