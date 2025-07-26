import type { Context } from "hono";

import chalk from "chalk";

import type { GameSessionType, GameSpinType, NewGameSpin, UserWithRelations } from "#/db/schema";

import { addSpinToCache, saveGameSessionToCache } from "#/lib/cache";
import { addXpToUser, calculateXpForWagerAndWins } from "#/routes/vip/vip.service";

export interface SpinParams {
  totalSpinWinnings: number;
  wagerAmount: number;
}
export interface SpinStats {
  totalSpinWinnings: number;
  wagerAmount: number;
}
export async function handleGameSpin(c: Context, spinInput: NewGameSpin, spinParams: SpinParams): Promise<Partial<GameSpinType>> {
  const user = c.get("user") as UserWithRelations;
  const gameSession = c.get("gameSession") as GameSessionType;

  if (!user || !gameSession) {
    throw new Error("handleGameSpin requires an active game session and authenticated user in the context.");
  }
  console.log(chalk.bgCyan(`Handling game spin for user: ${user.id} in session: ${gameSession.id}`));

  const { totalSpinWinnings, wagerAmount } = spinParams;

  const isWin = totalSpinWinnings > 0;
  if (user.vipInfo && user.vipInfo.length > 0) {
    const xpGained = calculateXpForWagerAndWins(wagerAmount, isWin, user.vipInfo[0]);

    if (xpGained > 0) {
      await addXpToUser(user.id, xpGained);
      console.log(chalk.yellow(`User ${user.id} earned ${xpGained} XP.`));
    }
  }

  gameSession.totalWagered = (gameSession.totalWagered || 0) + wagerAmount;
  gameSession.totalWon = (gameSession.totalWon || 0) + totalSpinWinnings;

  await saveGameSessionToCache(gameSession, c);

  const newSpin: Partial<NewGameSpin> = {
    spinData: spinInput.spinData as unknown,
    id: new Date().getTime().toString(),
    wagerAmount,
    grossWinAmount: totalSpinWinnings,
    sessionId: gameSession.id,
    userId: user.id,
    playerName: user.username,
    gameName: spinInput.gameName,
    createdAt: new Date(),
  };

  await addSpinToCache(gameSession.id, newSpin);

  return newSpin;
}
export async function updateGameSessionStats(c: Context, spinStats: SpinStats): Promise<void> {
  const gameSession = c.get("gameSession") as GameSessionType;

  if (!gameSession) {
    console.warn("Attempted to update game session stats, but no session was found in the context.");
    return;
  }

  const { totalSpinWinnings, wagerAmount } = spinStats;

  gameSession.totalWagered = (gameSession.totalWagered || 0) + wagerAmount;
  gameSession.totalWon = (gameSession.totalWon || 0) + totalSpinWinnings;

  await saveGameSessionToCache(gameSession, c);

  console.log(chalk.gray(`Updated session ${gameSession.id}: Wagered=${wagerAmount}, Won=${totalSpinWinnings}`));
}
