import type { Context } from 'hono'
import type { z } from 'zod'
import chalk from 'chalk'

import { and, eq, inArray } from 'drizzle-orm'

import type {
    GameSessionType,
    JackpotType,
    providerSpinResponseDataSchema,
    rtgSettingsRequestDtoSchema,
    rtgSettingsResponseDtoSchema,
    rtgSpinRequestDtoSchema,
    rtgSpinResponseDtoSchema,
    UserWithRelations,
} from '#/db/schema'

import db from '#/db'
import { jackpots } from '#/db/schema'
import { updateGameSessionStats } from '#/lib/gameplay'
import * as jackpotService from '#/lib/jackpot'
import { sendNotificationToUser } from '#/lib/websocket.service'
import {
    addXpTousers,
    calculateXpForWagerAndWins,
} from '#/modules/vip/vip.service'
import { creditTowallets, debitFromwallets } from '#/modules/wallet/wallet.service'
import { coinsToDollars, dollarsToCoins } from '#/utils/misc.utils'

import { atlantis_settings, atlantis_spin } from './data'
import { getGameSessionFromCache } from '#/lib/cache'

type ProviderSpinResponseData = z.infer<typeof providerSpinResponseDataSchema>
type RTGSettingsRequestDto = z.infer<typeof rtgSettingsRequestDtoSchema>
type RTGSettingsResponseDto = z.infer<typeof rtgSettingsResponseDtoSchema>
type RTGSpinRequestDto = z.infer<typeof rtgSpinRequestDtoSchema>
type RTGSpinResponseDto = z.infer<typeof rtgSpinResponseDtoSchema>

const testing = false

export async function createRedtigerSettings(
    user: UserWithRelations,
    gameName: string,
    authSessionId: string,
    data: RTGSettingsRequestDto
): Promise<RTGSettingsResponseDto | null> {
    console.log(chalk.magenta('--- createRedtigerSettings ---'))
    try {
        if (!authSessionId || !gameName || !user) {
            console.log(chalk.red('fuk'))
            return null
        }
        const gameSession = await getGameSessionFromCache(authSessionId)
        if (!gameSession) {
            console.log(chalk.red('fuk'))
            return null
        }
        let gameSettingsFromDeveloper: RTGSettingsResponseDto
        console.log(chalk.blue('testing', testing))
        if (testing) {
            gameSettingsFromDeveloper = atlantis_settings
        } else {
            const init = {
                body: JSON.stringify({
                    token: data.token,
                    sessionId: '0',
                    playMode: 'demo',
                    gameId: gameName.replace('RTG', ''),
                    userData: {
                        userId: data.userData!.userId,
                        affiliate: '',
                        lang: 'en',
                        channel: 'I',
                        userType: 'U',
                        fingerprint: data.userData?.fingerprint,
                        hash: '',
                    },
                    custom: { siteId: '', extras: '' },
                }),
                method: 'POST',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                },
            }
            const response = await fetch(
                `https://proxy.andrews.workers.dev/proxy/gserver-rtg.redtiger.com/rtg/platform/game/settings`,
                init
            )
            gameSettingsFromDeveloper = await response.json()
        }
        return gameSettingsFromDeveloper
    } catch (error: any) {
        return {
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
            },
        }
    }
}

export async function createRedtigerSpin(
    c: Context,
    data: RTGSpinRequestDto
): Promise<RTGSpinResponseDto> {
    console.log(chalk.magenta('--- createRedtigerSpin ---'))
    const user = c.get('user') as UserWithRelations
    const gameName = `${data.gamesId}RTG`
    const gameSession = c.get('gameSession') as GameSessionType
    console.log('user', user.id)
    console.log('gs', gameSession.id)
    if (!user || !gameSession) {
        console.log(chalk.red('fuk'))
        return {
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'User and game session are required.',
            },
        }
    }

    const wagerAmountCoins = dollarsToCoins(
        Number.parseFloat(data.stake as string)
    )

    try {
        await debitFromwallets(
            user.id,
            wagerAmountCoins,
            `Wager for ${gameName}`
        )

        let gameResultFromDeveloper: RTGSpinResponseDto
        if (testing) {
            gameResultFromDeveloper = atlantis_spin as unknown as RTGSpinResponseDto
        } else {
            const init = {
                body: JSON.stringify(data),
                method: 'POST',
                headers: { 'content-type': 'application/json;charset=UTF-8' },
            }
            const response = await fetch(
                `https://proxy.andrews.workers.dev/proxy/gserver-rtg.redtiger.com/rtg/platform/game/spin`,
                init
            )
            gameResultFromDeveloper = await response.json()
        }

        if (!gameResultFromDeveloper.success) {
            await creditTowallets(
                user.id,
                wagerAmountCoins,
                `Refund for failed spin on ${gameName}`
            )
            return gameResultFromDeveloper
        }

        const grossWinAmountCoins = dollarsToCoins(
            Number.parseFloat(gameResultFromDeveloper.result!.games.win.total)
        )

        if (grossWinAmountCoins > 0) {
            await creditTowallets(
                user.id,
                grossWinAmountCoins,
                `Win from ${gameName}`
            )
        }

        if (user.vipInfo) {
            const xpResult = calculateXpForWagerAndWins(
                wagerAmountCoins / 100, // Convert cents to dollars
                grossWinAmountCoins / 100, // Convert cents to dollars
                user.vipInfo
            )

            if (xpResult.totalXp > 0) {
                await addXpTousers(user.id, xpResult.totalXp)
                gameSession.totalXpGained =
                    (gameSession.totalXpGained || 0) + xpResult.totalXp
                c.set('gameSession', gameSession)
            }

            if (gameResultFromDeveloper.result?.games) {
                ;(gameResultFromDeveloper.result.games as any).xpBreakdown =
                    xpResult
            }
        } else {
            console.warn('No VIP info found for user:', user.id)
        }

        await updateGameSessionStats(c, {
            totalSpinWinnings: grossWinAmountCoins,
            wagerAmount: wagerAmountCoins,
        })

        const jackpotResult = await jackpotService.processJackpots({
            gameSpinId: 'temp-spin-id',
            wagerAmountCoins,
            gameCategory: 'SLOTS',
            userId: user.id,
        })

        const enhancedResponse = await enhanceRTGResponseWithJackpots(
            gameResultFromDeveloper.result as ProviderSpinResponseData,
            jackpotResult as any
        )
        gameResultFromDeveloper.result = enhancedResponse

        const winAmountInDollars = coinsToDollars(grossWinAmountCoins)
        const wagerAmountInDollars = coinsToDollars(wagerAmountCoins)

        if (winAmountInDollars > (wagerAmountInDollars * 100)) {
            sendNotificationToUser(user.id, {
                title: 'recording:upload',
                message: JSON.stringify({
                    sessionId: gameSession.id,
                    reason: 'big_win',
                    winAmount: winAmountInDollars,
                    wagerAmount: wagerAmountInDollars,
                })
            })
        }

        if (winAmountInDollars > 10) {
            sendNotificationToUser(user.id, {
                title: 'Big Win!',
                message: `Congratulations! You won ${winAmountInDollars.toFixed(2)} on ${gameName}!`,
            })
        }

        return gameResultFromDeveloper
    } catch (error) {
        console.error('Error creating Redtiger spin:', error)
        return {
            success: false,
            error: {
                code: 'SPIN_FAILED',
                message:
                    error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred.',
            },
        }
    }
}

async function enhanceRTGResponseWithJackpots(
    originalResponse: ProviderSpinResponseData,
    jackpotResult: {
        contributions: {
            jackpotType: string
            contributionAmountCoins: number
        }[]
        jackpotWin: {
            id: string
            jackpotType: string
            winAmountCoins: number
        } | null
    }
): Promise<ProviderSpinResponseData> {
    const enhancedResponse = { ...originalResponse }

    if (jackpotResult?.contributions?.length > 0) {
        enhancedResponse.jackpots = {
            contributions: jackpotResult.contributions.map(
                (contrib: {
                    jackpotType: string
                    contributionAmountCoins: number
                }) => ({
                    type: contrib.jackpotType,
                    amount: coinsToDollars(contrib.contributionAmountCoins),
                    amountCoins: contrib.contributionAmountCoins,
                })
            ),
            totalContribution: coinsToDollars(
                jackpotResult.contributions.reduce(
                    (
                        acc: number,
                        contrib: { contributionAmountCoins: number }
                    ) => acc + contrib.contributionAmountCoins,
                    0
                )
            ),
        }
    }

    if (jackpotResult?.jackpotWin) {
        const jackpotWin = jackpotResult.jackpotWin

        enhancedResponse.jackpots = {
            ...enhancedResponse.jackpots,
            type: jackpotWin.jackpotType,
            amount: coinsToDollars(jackpotWin.winAmountCoins),
            amountCoins: jackpotWin.winAmountCoins,
            winId: jackpotWin.id,
        }

        if (enhancedResponse.user?.balance?.cash?.atEnd) {
            const currentBalance = Number.parseFloat(
                enhancedResponse.user.balance.cash.atEnd
            )
            const newBalance =
                currentBalance + coinsToDollars(jackpotWin.winAmountCoins)
            enhancedResponse.user.balance.cash.atEnd = newBalance.toFixed(2)
        }

        if (enhancedResponse.games?.win?.total) {
            const currentWin = Number.parseFloat(
                enhancedResponse.games.win.total
            )
            const newWin =
                currentWin + coinsToDollars(jackpotWin.winAmountCoins)
            enhancedResponse.games.win.total = newWin.toFixed(2)
        }
    }

    const eligibleTypes = ['MAJOR', 'MINOR', 'GRAND']
    const currentJackpots = await db.query.jackpots.findMany({
        where: and(
            inArray(
                jackpots.type,
                eligibleTypes as (typeof jackpots.type.enumValues)[number][]
            ),
            eq(jackpots.isActive, true)
        ),
    })
    ;(
        enhancedResponse as ProviderSpinResponseData & {
            currentJackpots: unknown[]
        }
    ).currentJackpots = currentJackpots.map((jackpot: JackpotType) => ({
        type: jackpot.type,
        amount: coinsToDollars(jackpot.currentAmountCoins),
        amountCoins: jackpot.currentAmountCoins,
    }))

    return enhancedResponse
}
