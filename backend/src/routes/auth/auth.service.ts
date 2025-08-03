import { eq } from 'drizzle-orm'
import * as jose from 'jose'

import db from '#/db'
import type { AuthSessionType, Newusers, UserType } from '#/db/schema'
import { users } from '#/db/schema'
import env from '#/env'
import { SessionManager } from '#/lib/session.manager'
import { nanoid } from '#/utils/nanoid'

const ACCESS_TOKEN_EXPIRES_IN = '7 days'

type LoginResult = { accessToken: string; user: UserType } | { error: string }
type SignupResult = { accessToken: string; user: UserType } | { error: string }

export async function login(
    username?: string,
    password?: string,
    uid?: string
): Promise<LoginResult> {
    if (!password) {
        return { error: 'Password is required' }
    }
    if (!username && !uid) {
        return { error: 'Username or UID is required' }
    }

    let userRecord: UserType | undefined
    try {
        if (username) {
            userRecord = await db.query.users.findFirst({
                where: eq(users.username, username),
            })
        } else if (uid) {
            userRecord = await db.query.users.findFirst({ where: eq(users.id, uid) })
        }
    } catch (error) {
        console.error('Error querying user:', error)
        return { error: 'Database error while fetching user.' }
    }

    if (!userRecord?.passwordHash) {
        return { error: 'Invalid username or password.' }
    }

    const isPasswordValid = await Bun.password.verify(
        password,
        userRecord.passwordHash
    )
    if (!isPasswordValid) {
        return { error: 'Invalid username or password.' }
    }

    const authSession = await SessionManager.startAuthSession(userRecord)

    const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)
    const accessToken = await new jose.SignJWT({
        userId: userRecord.id,
        sessionId: authSession.id,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
        .sign(secret)

    const user = { ...userRecord, passwordHash: null }

    return { accessToken, user }
}

export async function logout(
    authSession: AuthSessionType,
    userId: string
): Promise<void> {
    await SessionManager.endAuthSession(authSession.id, userId)
}

export async function signup(
    username: string,
    password: string
): Promise<SignupResult> {
    const passwordHash = await Bun.password.hash(password, 'bcrypt')

    try {
        const user = await db.transaction(async (tx) => {
            const existingUser = await tx.query.users.findFirst({
                where: eq(users.username, username),
            })

            if (existingUser) {
                throw new Error('User with this username already exists')
            }

            const newUserValues: Newusers = {
                id: nanoid(),
                username,
                passwordHash,
                totalXpGained: 0,
            }

            const [newUser] = await tx
                .insert(users)
                .values(newUserValues)
                .returning()
            return newUser
        })

        const authSession = await SessionManager.startAuthSession(user)

        const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET)
        const accessToken = await new jose.SignJWT({
            userId: user.id,
            sessionId: authSession.id,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
            .sign(secret)

        return { accessToken, user: { ...user, passwordHash: null } }
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'An unknown error occurred.'
        return { error: message }
    }
}