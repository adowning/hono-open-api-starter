import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { BunSQLQueryResultHKT } from 'drizzle-orm/bun-sql'
import type { PgTransaction } from 'drizzle-orm/pg-core'

import { eq } from 'drizzle-orm'

import type { VipInfoType, VipRankType, } from '#/db'
import db, { users, vipInfo, vipRank } from '#/db'
import type * as schema from '#/db/schema'
import { publishUserUpdated } from '#/lib/websocket.service'

import { nanoid } from 'nanoid'
import { getAllVipLevelConfigurations, getVipLevelByTotalXp, getVipLevelConfiguration } from './vip.config' // Ensure the function is imported

type Transaction = PgTransaction<BunSQLQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>

export interface XpCalculationResult {
    xpGained: number;
    newTotalXp: number;
    newCurrentLevelXp: number;
    levelChanged: boolean;
    newLevel: number;
    oldLevel: number;
}

interface VipDetails {
    info: VipInfoType;
    rank: VipRankType;
    xpForNextLevel: number;
}

// Export the function so the controller can use it
export { getAllVipLevelConfigurations as getAllvipLevelConfigurations }

export async function getAllvipLevels() {
    return db.query.vipLevel.findMany()
}

export async function getAllvipRanks() {
    return db.query.vipRank.findMany()
}

/**
 * Retrieves a comprehensive overview of a user's VIP status.
 */
export async function getVipDetailsForusers(userId: string): Promise<VipDetails | null> {
    let _vipInfo = await db.query.vipInfo.findFirst({ where: eq(vipInfo.userId, userId) })
    if (!_vipInfo) {
        _vipInfo = await db.transaction(async tx => createDefaultvipInfo(userId, tx as any))
    }
    if (!_vipInfo) {
        return null
    }
    const currentRank = await db.query.vipRank.findFirst({
        where: eq(vipRank.id, vipInfo.currentRankid!),
    })

    if (!currentRank) {
        throw new Error(`No matching VIP Rank found for user ${userId}.`)
    }

    const nextLevelData = await db.query.vipLevel.findFirst({
        where: eq(vipInfo.level, _vipInfo.level),
    })

    if (!nextLevelData) {
        throw new Error(`XP requirement for level ${_vipInfo.level} not found.`)
    }

    return {
        info: _vipInfo,
        rank: currentRank,
        xpForNextLevel: nextLevelData.xpForNext,
    }
}

export function calculateXpForWagerAndWins(
    wagerAmount: number,
    winAmount: number,
    vipInfo: VipInfoType
): { baseXp: number; bonusXp: number; totalXp: number } {
    if (wagerAmount <= 0) {
        return { baseXp: 0, bonusXp: 0, totalXp: 0 }
    }

    const levelConfig = getVipLevelConfiguration(vipInfo.level)
    const multiplier = levelConfig?.dailyBonusMultiplier || 1.0

    // Base XP is from the wager amount
    const baseXp = Math.floor(wagerAmount * multiplier)

    // Bonus XP is based on the win multiplier
    let bonusXp = 0
    const winMultiplier = winAmount / wagerAmount

    if (winMultiplier >= 100) { // Mega Win
        bonusXp = Math.floor(baseXp * 1.00) // 100% bonus
    } else if (winMultiplier >= 50) { // Huge Win
        bonusXp = Math.floor(baseXp * 0.50) // 50% bonus
    } else if (winMultiplier >= 10) { // Big Win
        bonusXp = Math.floor(baseXp * 0.25) // 25% bonus
    }

    // If it was a winning spin, double the base XP
    const totalXp = (winAmount > 0 ? baseXp * 2 : baseXp) + bonusXp

    return { baseXp, bonusXp, totalXp }
}

export async function addXpTousers(userId: string, xpAmount: number): Promise<XpCalculationResult | null> {
    if (xpAmount <= 0) {
        throw new Error('XP amount must be positive')
    }

    return await db.transaction(async (tx) => {
        let _vipInfo = await tx.query.vipInfo.findFirst({ where: eq(vipInfo.userId, userId) })
        if (!_vipInfo) {
            _vipInfo = await createDefaultvipInfo(userId, tx as any)
        }
        if (!_vipInfo) {
            return null
        }
        const oldLevel = _vipInfo.level
        const oldTotalXp = _vipInfo.totalXp
        const newTotalXp = oldTotalXp + xpAmount

        const newLevelConfig = getVipLevelByTotalXp(newTotalXp)
        const newLevel = newLevelConfig.level
        const newCurrentLevelXp = newTotalXp - newLevelConfig.cumulativeXpToReach

        await tx.update(vipInfo).set({
            totalXp: newTotalXp,
            level: newLevel,
            xp: newCurrentLevelXp,
        }).where(eq(vipInfo.userId, userId))

        const result = {
            xpGained: xpAmount,
            newTotalXp,
            newCurrentLevelXp,
            levelChanged: oldLevel !== newLevel,
            newLevel,
            oldLevel,
        }

        if (result.levelChanged) {
            await applyLevelUpBenefits(userId, newLevel, tx as any)
        }

        return result
    }).then((result) => {
        // Notify client with a VIP patch. Include minimal fields; client can refetch snapshot if needed.
        publishUserUpdated(userId, {
            vipInfo: result
                ? {
                        level: result.newLevel,
                        totalXp: result.newTotalXp,
                        xp: result.newCurrentLevelXp,
                    }
                : {},
        })
        return result
    })
}

async function createDefaultvipInfo(userId: string, tx: Transaction): Promise<VipInfoType> {
    const _users = await tx.select().from(users).where(eq(users.id, userId)).limit(1)
    if (!_users[0]) {
        throw new Error(`users with ID ${userId} not found.`)
    }
    const id = nanoid()
    const [newvipInfo] = await tx.insert(vipInfo).values({
        id,
        userId,
        level: 1,
        xp: 0,
        totalXp: 0,
    }).returning()

    return newvipInfo
}

async function applyLevelUpBenefits(userId: string, newLevel: number, _tx: Transaction): Promise<void> {
    const levelConfig = getVipLevelConfiguration(newLevel)
    if (!levelConfig)
        return

    // The tx parameter is currently unused, prefixing with _ to satisfy ESLint
    console.log(`users ${userId} has reached level ${newLevel}! Applying benefits.`)
}
