import type {
    GameSessionType,
    GameSpinType,
    NewgameSpins,
    UserWithRelations,
} from '#/db/schema'
import { addSpinToCache, saveGameSessionToCache } from '#/lib/cache'
import {
    addXpTousers,
    calculateXpForWagerAndWins,
} from '#/routes/vip/vip.service'
import chalk from 'chalk'
import type { Context } from 'hono'

export interface SpinParams {
    totalSpinWinnings: number
    wagerAmount: number
}
export interface SpinStats {
    totalSpinWinnings: number
    wagerAmount: number
}
export async function handleGameSpin(
    c: Context,
    spinInput: NewgameSpins,
    spinParams: SpinParams
): Promise<GameSpinType> {
    const user = c.get('user') as UserWithRelations
    const gameSession = c.get('gameSession') as GameSessionType

    if (!user || !gameSession) {
        throw new Error(
            'handleGameSpin requires an active game session and authenticated user in the context.'
        )
    }
    console.log(
        chalk.bgCyan(
            `Handling game spin for user: ${user.id} in session: ${gameSession.id}`
        )
    )

    const { totalSpinWinnings, wagerAmount } = spinParams

    if (user.vipInfo) {
        const xpGained = calculateXpForWagerAndWins(
            wagerAmount / 100, // Convert cents to dollars
            totalSpinWinnings / 100,
            user.vipInfo
        )

        if (xpGained.totalXp > 0) {
            await addXpTousers(user.id, xpGained.totalXp)
            console.log(
                chalk.yellow(`User ${user.id} earned ${xpGained.totalXp} XP.`)
            )
        }
    }

    gameSession.totalWagered = (gameSession.totalWagered || 0) + wagerAmount
    gameSession.totalWon = (gameSession.totalWon || 0) + totalSpinWinnings

    await saveGameSessionToCache(gameSession)

    const newSpin: GameSpinType = {
        id: new Date().getTime().toString(),
        wagerAmount,
        grossWinAmount: totalSpinWinnings,
        sessionId: gameSession.id,
        userId: user.id,
        playerName: user.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        occurredAt: new Date().toISOString(),
        spinNumber: 0, // This should be properly calculated based on session spin count
        playerAvatar: user.avatar_url,
        currencyId: 'USD',
        sessionDataId: gameSession.id,
        gameId: spinInput.gameId ?? null,
        gameName: spinInput.gameName ?? null,
        spinData: spinInput.spinData,
    }

    await addSpinToCache(gameSession.id, newSpin)

    return newSpin
}
export async function updateGameSessionStats(
    c: Context,
    spinStats: SpinStats
): Promise<void> {
    const gameSession = c.get('gameSession') as GameSessionType

    if (!gameSession) {
        console.warn(
            'Attempted to update game session stats, but no session was found in the context.'
        )
        return
    }

    const { totalSpinWinnings, wagerAmount } = spinStats

    gameSession.totalWagered = (gameSession.totalWagered || 0) + wagerAmount
    gameSession.totalWon = (gameSession.totalWon || 0) + totalSpinWinnings

    await saveGameSessionToCache(gameSession)

    console.log(
        chalk.gray(
            `Updated session ${gameSession.id}: Wagered=${wagerAmount}, Won=${totalSpinWinnings}`
        )
    )
}
