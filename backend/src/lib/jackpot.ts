import chalk from 'chalk'
import { and, desc, eq, inArray } from 'drizzle-orm'

import type {
    JackpotContributionType,
    JackpotType,
    JackpotWinType,
    Newjackpots,
} from '#/db/schema'

import db from '#/db'
import {
    gameSpins,
    jackpotContributions,
    jackpots,
    jackpotWins,
    transactions,
    wallets,
} from '#/db/schema'
import { coinsToDollars } from '#/utils/misc.utils'

import { nanoid } from '#/utils/nanoid'
import { triggerUserUpdate } from './websocket.service'

export function dollarsToCoins(dollars: number): number {
    return Math.round(dollars * 100)
}

export function calculateContribution(
    wagerCoins: number,
    contributionRateBasisPoints: number
): number {
    return Math.floor((wagerCoins * contributionRateBasisPoints) / 10000)
}

export enum JackpotTypeEnum {
    MINOR = 'MINOR',
    MAJOR = 'MAJOR',
    GRAND = 'GRAND',
}

export const JACKPOT_CONFIG = {
    [JackpotTypeEnum.MINOR]: {
        type: JackpotTypeEnum.MINOR,
        seedAmountCoins: 1000,
        minimumBetCoins: 1,
        contributionRateBasisPoints: 100, // 1%
        probabilityPerMillion: 1000, // 0.1%
        minimumTimeBetweenWinsMinutes: 1,
    },
    [JackpotTypeEnum.MAJOR]: {
        type: JackpotTypeEnum.MAJOR,
        seedAmountCoins: 10000,
        minimumBetCoins: 10,
        contributionRateBasisPoints: 150, // 1.5%
        probabilityPerMillion: 100, // 0.01%
        minimumTimeBetweenWinsMinutes: 60,
    },
    [JackpotTypeEnum.GRAND]: {
        type: JackpotTypeEnum.GRAND,
        seedAmountCoins: 100000,
        minimumBetCoins: 20,
        contributionRateBasisPoints: 200, // 2%
        probabilityPerMillion: 10, // 0.001%
        minimumTimeBetweenWinsMinutes: 1440, // 24 hours
    },
}

export function getEligibleJackpots(wagerCoins: number): JackpotTypeEnum[] {
    const eligible: JackpotTypeEnum[] = []
    if (wagerCoins >= JACKPOT_CONFIG.MINOR.minimumBetCoins)
        eligible.push(JackpotTypeEnum.MINOR)
    if (wagerCoins >= JACKPOT_CONFIG.MAJOR.minimumBetCoins)
        eligible.push(JackpotTypeEnum.MAJOR)
    if (wagerCoins >= JACKPOT_CONFIG.GRAND.minimumBetCoins)
        eligible.push(JackpotTypeEnum.GRAND)
    return eligible
}

export function generateRandomSeedAmount(baseSeedCoins: number): number {
    const variation = Math.floor(baseSeedCoins * 0.1)
    const randomOffset =
        Math.floor(Math.random() * (variation * 2 + 1)) - variation
    return baseSeedCoins + randomOffset
}

export function canWinJackpot(
    lastWonAt: string | null,
    minimumTimeBetweenWinsMinutes: number
): boolean {
    if (!lastWonAt) return true
    const now = new Date()
    const timeDiffMinutes = (now.getTime() - new Date(lastWonAt).getTime()) / (1000 * 60)
    return timeDiffMinutes >= minimumTimeBetweenWinsMinutes
}

export function checkJackpotWin(probabilityPerMillion: number): boolean {
    const randomNumber = Math.floor(Math.random() * 1000000)
    return randomNumber < probabilityPerMillion
}

export async function findManyJackpot(): Promise<JackpotType[]> {
    try {
        return await db.select().from(jackpots)
    } catch (error) {
        console.error('Error fetching Jackpots:', error)
        throw new Error('Could not fetch Jackpots')
    }
}

export async function createJackpot(data: Newjackpots): Promise<JackpotType> {
    try {
        const [newJackpot] = await db.insert(jackpots).values(data).returning()
        return newJackpot
    } catch (error) {
        console.error('Error creating Jackpot:', error)
        throw new Error('Could not create Jackpot')
    }
}

export async function findJackpotById(
    id: string
): Promise<JackpotType | undefined> {
    try {
        const [jackpot] = await db
            .select()
            .from(jackpots)
            .where(eq(jackpots.id, id))
        return jackpot
    } catch (error) {
        console.error(`Error fetching Jackpot by ID ${id}:`, error)
        throw new Error('Could not fetch Jackpot by ID')
    }
}

export async function updateJackpot(
    id: string,
    data: Partial<Newjackpots>
): Promise<JackpotType> {
    try {
        const [updatedJackpot] = await db
            .update(jackpots)
            .set(data)
            .where(eq(jackpots.id, id))
            .returning()
        return updatedJackpot
    } catch (error) {
        console.error(`Error updating Jackpot ${id}:`, error)
        throw new Error('Could not update Jackpot')
    }
}

export async function deleteJackpot(id: string): Promise<JackpotType> {
    try {
        const [deletedJackpot] = await db
            .delete(jackpots)
            .where(eq(jackpots.id, id))
            .returning()
        return deletedJackpot
    } catch (error) {
        console.error(`Error deleting Jackpot ${id}:`, error)
        throw new Error('Could not delete Jackpot')
    }
}

export async function initializeJackpots(): Promise<void> {
    const result = await db.select({ count: jackpots.id }).from(jackpots).limit(1)
    const existingJackpotsCount =
        result.length > 0 ? Number(result[0].count) : 0

    if (existingJackpotsCount === 0) {
        console.log(chalk.yellow('Initializing jackpots...'))
        const jackpotData = Object.values(JACKPOT_CONFIG).map((config) => ({
            id: nanoid(),
            type: config.type,
            currentAmountCoins: config.seedAmountCoins,
            seedAmountCoins: config.seedAmountCoins,
            minimumBetCoins: config.minimumBetCoins,
            contributionRateBasisPoints: config.contributionRateBasisPoints,
            probabilityPerMillion: config.probabilityPerMillion,
            minimumTimeBetweenWinsMinutes: config.minimumTimeBetweenWinsMinutes,
            isActive: true,
        }))

        await db.insert(jackpots).values(jackpotData)
        console.log('Jackpots initialized successfully.')
    }
}

export interface AsyncJackpotProcessingRequest {
    gameSpinId: string
    userId: string
    wagerAmountCoins: number
    gameCategory: string
}

export async function processJackpots(
    request: AsyncJackpotProcessingRequest
) {
    const { gameSpinId, userId, wagerAmountCoins, gameCategory } = request
    console.log(chalk.yellow('Processing jackpots for spin:', gameSpinId))

    if (gameCategory !== 'SLOTS') {
        return { contributions: [] }
    }

    const eligibleJackpotTypes = getEligibleJackpots(wagerAmountCoins)
    if (eligibleJackpotTypes.length === 0) {
        return { contributions: [] }
    }

    const activeJackpots = await db
        .select()
        .from(jackpots)
        .where(
            and(
                inArray(jackpots.type, eligibleJackpotTypes),
                eq(jackpots.isActive, true)
            )
        )

    if (activeJackpots.length === 0) {
        return { contributions: [] }
    }

    return db.transaction(async (tx) => {
        const contributions: Partial<JackpotContributionType>[] = []
        let jackpotWin: JackpotWinType | null = null

        for (const jackpot of activeJackpots) {
            const config =
                JACKPOT_CONFIG[jackpot.type as keyof typeof JACKPOT_CONFIG]
            if (!config) continue

            const contributionAmount = calculateContribution(
                wagerAmountCoins,
                config.contributionRateBasisPoints
            )

            if (contributionAmount > 0) {
                await tx.insert(jackpotContributions).values({
                    id: nanoid(),
                    jackpotId: jackpot.id,
                    gameSpinId,
                    contributionAmountCoins: contributionAmount,
                })

                const [updatedJackpot] = await tx
                    .update(jackpots)
                    .set({
                        currentAmountCoins:
                            jackpot.currentAmountCoins + contributionAmount,
                    })
                    .where(eq(jackpots.id, jackpot.id))
                    .returning()

                contributions.push({
                    contributionAmountCoins: contributionAmount,
                    jackpotId: jackpot.id,
                    gameSpinId,
                })

                if (
                    !jackpotWin &&
                    canWinJackpot(
                        jackpot.lastWonAt,
                        config.minimumTimeBetweenWinsMinutes
                    ) &&
                    checkJackpotWin(config.probabilityPerMillion)
                ) {
                    const winAmount = updatedJackpot.currentAmountCoins
                    const newSeedAmount = generateRandomSeedAmount(
                        jackpot.seedAmountCoins
                    )

                    await tx
                        .update(jackpots)
                        .set({
                            currentAmountCoins: newSeedAmount,
                            lastWonAt: new Date().toISOString(),
                            lastWonBy: userId,
                        })
                        .where(eq(jackpots.id, jackpot.id))

                    const [win] = await tx
                        .insert(jackpotWins)
                        .values({
                            id: nanoid(),
                            jackpotId: jackpot.id,
                            winnerId: userId,
                            winAmountCoins: winAmount,
                            gameSpinId,
                        })
                        .returning()

                    jackpotWin = win
                }
            }
        }
        return { contributions, jackpotWin }
    })
}

export async function getJackpotStats() {
    console.log(chalk.yellow('Getting jackpot stats'))
    const allJackpots = await db.query.jackpots.findMany({
        where: eq(jackpots.isActive, true),
        with: {

            user: {
                columns: {
                    username: true,
                },
            },
        },
    })

    const totalPoolCoins = allJackpots.reduce(
        (sum, j) => sum + j.currentAmountCoins,
        0
    )

    return {
        totalPoolCoins,
        totalPoolDollars: coinsToDollars(totalPoolCoins),
        jackpots: allJackpots.map((j) => ({
            type: j.type,
            currentAmountCoins: j.currentAmountCoins,
            currentAmountDollars: coinsToDollars(j.currentAmountCoins),
            lastWonAt: j.lastWonAt,
            lastWinnerUsername: j.user?.username || null,
        })),
    }
}

// Correctly infer the return type of the function for RecentJackpotWin
export type RecentJackpotWin = Awaited<
    ReturnType<typeof getRecentJackpotWins>
>[number]

export async function getRecentJackpotWins(limit: number = 10) {
    console.log(chalk.yellow('Getting recent jackpot wins'))
    const _jackpotWins = await db.query.jackpotWins.findMany({
        limit,
        orderBy: [desc(jackpotWins.createdAt)],
        with: {
            user: {
                columns: {
                    username: true,
                    avatar_url: true,
                },
            },
        },
    })

    const result = await Promise.all(
        _jackpotWins.map(async (win) => {
            const jackpot = await db.query.jackpots.findFirst({
                where: eq(jackpots.id, win.jackpotId),
                columns: {
                    type: true,
                },
            })
            return {
                ...win,
                jackpot,
            }
        })
    )

    return result
}

export async function getUserJackpotContributions(
    userId: string,
    limit: number = 50
) {
    console.log(
        chalk.yellow('Getting user jackpot contributions for user:', userId)
    )
    return db
        .select({
            id: jackpotContributions.id,
            jackpotId: jackpotContributions.jackpotId,
            jackpotType: jackpots.type,
            gameSpinId: jackpotContributions.gameSpinId,
            contributionAmountCoins:
                jackpotContributions.contributionAmountCoins,
            createdAt: jackpotContributions.createdAt,
            userId: gameSpins.userId,
        })
        .from(jackpotContributions)
        .innerJoin(gameSpins, eq(jackpotContributions.gameSpinId, gameSpins.id))
        .innerJoin(jackpots, eq(jackpotContributions.jackpotId, jackpots.id))
        .where(eq(gameSpins.userId, userId))
        .orderBy(desc(jackpotContributions.createdAt))
        .limit(limit)
}

export async function getUserJackpotWins(
    userId: string
): Promise<JackpotWinType[]> {
    console.log(chalk.yellow('Getting user jackpot wins for user:', userId))
    return db
        .select()
        .from(jackpotWins)
        .where(eq(jackpotWins.winnerId, userId))
        .orderBy(desc(jackpotWins.createdAt))
}

export async function getJackpotById(id: string) {
    console.log(chalk.yellow('Getting jackpot by id:', id))
    return db.query.jackpots.findFirst({
        where: eq(jackpots.id, id),
        with: {
            user: {
                columns: {
                    username: true,
                    avatar_url: true,
                },
            },
        },
    })
}

interface JackpotWinParams {
    userId: string
    gameId: string
    amount: number
    jackpotType: string
    walletId: string
}

export async function handleJackpotWin({
    userId,
    gameId,
    amount,
    jackpotType,
    walletId,
}: JackpotWinParams) {
    if (!amount || amount <= 0) {
        throw new Error('Invalid jackpot amount')
    }

    return await db
        .transaction(async (tx) => {
            const [wallet] = await tx
                .select({ balance: wallets.balance })
                .from(wallets)
                .where(eq(wallets.id, walletId))

            if (!wallet) {
                throw new Error('Wallet not found')
            }

            const newBalance = wallet.balance + amount

            await tx.insert(transactions).values({
                id: nanoid(),
                type: 'JACKPOT_WIN',
                amount,
                userId,
                walletId,
                relatedGameId: gameId,
                description: `${jackpotType.toUpperCase()} Jackpot Win`,
                balanceBefore: wallet.balance,
                balanceAfter: newBalance,
            })

            await tx
                .update(wallets)
                .set({ balance: newBalance })
                .where(eq(wallets.id, walletId))

            console.log(`Jackpot win processed: ${amount} for user ${userId}`)

            return { success: true, newBalance }
        })
        .then((result) => {
            if (result.success) {
                triggerUserUpdate(userId)
            }
            return result
        })
}