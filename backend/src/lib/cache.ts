import type { Context } from 'hono'

import { KeyValueStore, SqliteAdapter } from '@bnk/kv-store'

import type { GameSessionType, GameSpinType } from '#/db/types'

const adapter = new SqliteAdapter({
    path: 'sessions.db',
    tableName: 'sessions',
})
const cache = new KeyValueStore({ adapter })
const SPINS_PREFIX = 'spins:'

function normalizeCacheResult<T>(data: any): T {
    if (Array.isArray(data)) {
        return data.map((item) => normalizeCacheResult(item)) as T
    }
    if (typeof data === 'object' && data !== null) {
        const normalizedData: { [key: string]: any } = {}
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (Array.isArray(data[key])) {
                    normalizedData[key] = data[key][0]
                } else {
                    normalizedData[key] = data[key]
                }
            }
        }
        return normalizedData as T
    }
    return data as T
}

export function getGameSessionFromCache(
    sessionId: string
): GameSessionType | null {
    const data = cache.get<any>(sessionId)
    if (!data) {
        return null
    }
    const normalizedData = normalizeCacheResult<GameSessionType>(data)
    // The session ID MUST be a string. If it's corrupted, use the key we used to fetch it.
    if (typeof normalizedData.id !== 'string' || !normalizedData.id) {
        normalizedData.id = sessionId
    }
    return normalizedData
}

export async function saveGameSessionToCache(
    session: GameSessionType,
    c: Context
): Promise<void> {
    cache.set(session.id, session)
    c.set('gameSession', session)
}

export async function deleteGameSessionFromCache(
    sessionId: string
): Promise<void> {
    cache.delete(sessionId)
}

export async function getSpinsFromCache(
    sessionId: string
): Promise<Partial<GameSpinType>[]> {
    const spinsKey = `${SPINS_PREFIX}${sessionId}`
    const spins = cache.get<Partial<GameSpinType>[]>(spinsKey) || []
    return normalizeCacheResult(spins)
}

export async function addSpinToCache(
    sessionId: string,
    spin: Partial<GameSpinType>
): Promise<void> {
    const spinsKey = `${SPINS_PREFIX}${sessionId}`
    const spins = await getSpinsFromCache(sessionId)
    spins.push(spin)
    cache.set(spinsKey, spins)
}

export async function deleteSpinsFromCache(sessionId: string): Promise<void> {
    const spinsKey = `${SPINS_PREFIX}${sessionId}`
    cache.delete(spinsKey)
}
