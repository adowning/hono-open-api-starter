import type { Context } from "hono";

import chalk from "chalk";

import type { GameSessionType, GameSpinType, NewGameSpin, UserWithRelations } from "#/db";

import { addSpinToCache, saveGameSessionToCache } from "#/lib/cache";

export interface SpinParams {
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

  const xpEarned = Math.floor(wagerAmount);
  if (xpEarned > 0) {
    gameSession.totalXpGained = (gameSession.totalXpGained || 0) + xpEarned;
    console.log(chalk.yellow(`User ${user.id} earned ${xpEarned} XP. Session total: ${gameSession.totalXpGained}`));
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
