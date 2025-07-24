import type { Context } from "hono";
import type { z } from "zod";

import { and, eq, inArray } from "drizzle-orm";

import type { GameSessionType, JackpotType, providerSpinResponseDataSchema, rtgSettingsRequestDtoSchema, rtgSettingsResponseDtoSchema, rtgSpinRequestDtoSchema, rtgSpinResponseDtoSchema, UserWithRelations } from "#/db";

import db from "#/db";
import { GameSession, Jackpot } from "#/db/schema";
import { updateGameSessionStats } from "#/lib/gameplay";
import { processJackpots } from "#/lib/jackpot";
import { sendNotificationToUser } from "#/lib/websocket.service";
import { addXpToUser, calculateXpForWagerAndWins } from "#/routes/vip/vip.service";
import { creditToWallet, debitFromWallet } from "#/routes/wallet/wallet.service";
import { coinsToDollars, dollarsToCoins } from "#/utils/misc.utils";

import { atlantis_settings, atlantis_spin } from "./data";

type ProviderSpinResponseData = z.infer<typeof providerSpinResponseDataSchema>;
type RTGSettingsRequestDto = z.infer<typeof rtgSettingsRequestDtoSchema>;
type RTGSettingsResponseDto = z.infer<typeof rtgSettingsResponseDtoSchema>;
type RTGSpinRequestDto = z.infer<typeof rtgSpinRequestDtoSchema>;
type RTGSpinResponseDto = z.infer<typeof rtgSpinResponseDtoSchema>;

const testing = false;

async function getGameSessionById(_c: Context, gameSessionId: string): Promise<GameSessionType | null> {
  const [session] = await db.select().from(GameSession).where(eq(GameSession.id, gameSessionId));
  return session || null;
}

export async function createRedtigerSettings(user: UserWithRelations, gameName: string, gameSessionId: string, c: Context, data: RTGSettingsRequestDto): Promise<RTGSettingsResponseDto> {
  try {
    if (!user) {
      throw new Error("User not authenticated.");
    }

    if (!gameSessionId || !gameName) {
      throw new Error("gameSessionId and gameName are required.");
    }

    const gameSession = await getGameSessionById(c, gameSessionId);
    if (!gameSession) {
      throw new Error("Game session not found.");
    }
    let gameSettingsFromDeveloper: Partial<RTGSettingsResponseDto>;
    if (testing) {
      gameSettingsFromDeveloper = atlantis_settings;
      gameSettingsFromDeveloper.result!.user.balance.cash = (user.activeWallet!.balance! / 100).toFixed(2);
    }
    else {
      const init = {
        body: JSON.stringify({
          token: data.token,
          sessionId: "0",
          playMode: "demo",
          gameId: gameName.replace("RTG", ""),
          userData: {
            userId: data.userData!.userId,
            affiliate: "",
            lang: "en",
            channel: "I",
            userType: "U",
            fingerprint: data.userData?.fingerprint,
            hash: "",
          },
          custom: { siteId: "", extras: "" },
        }),
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      };
      console.log(init);
      const response = await fetch(
        `https://proxy.andrews.workers.dev/proxy/gserver-rtg.redtiger.com/rtg/platform/game/settings`,
        init,
      );
      console.log(response);
      gameSettingsFromDeveloper = await response.json();
      console.log(gameSettingsFromDeveloper);
    }

    return {
      ...gameSettingsFromDeveloper,
      success: true,
    };
  }
  catch (error: any) {
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      },
    };
  }
}

export async function createRedtigerSpin(c: Context, data: RTGSpinRequestDto): Promise<RTGSpinResponseDto> {
  const user = c.get("user") as UserWithRelations;
  const gameName = `${data.gameId}RTG`;
  const gameSession = c.get("gameSession") as GameSessionType;

  if (!user || !gameSession) {
    throw new Error("User and game session are required.");
  }

  const wagerAmountCoins = dollarsToCoins(Number.parseFloat(data.stake as string));

  try {
    // 1. Debit wallet BEFORE the spin
    await debitFromWallet(user.id, wagerAmountCoins, `Wager for ${gameName}`);

    // 2. Get the spin result from the game provider
    let gameResultFromDeveloper: RTGSpinResponseDto;
    if (testing) {
      gameResultFromDeveloper = atlantis_spin;
    }
    else {
      const init = {
        body: JSON.stringify(data),
        method: "POST",
        headers: { "content-type": "application/json;charset=UTF-8" },
      };
      console.log(init);
      const response = await fetch(
        `https://proxy.andrews.workers.dev/proxy/gserver-rtg.redtiger.com/rtg/platform/game/spin`,
        init,
      );
      console.log(response);
      gameResultFromDeveloper = await response.json();
      console.log(gameResultFromDeveloper);
    }

    // 3. Handle provider failure: refund the user and exit
    if (!gameResultFromDeveloper.success) {
      await creditToWallet(user.id, wagerAmountCoins, `Refund for failed spin on ${gameName}`);
      return gameResultFromDeveloper;
    }

    const grossWinAmountCoins = dollarsToCoins(Number.parseFloat(gameResultFromDeveloper.result!.game.win.total));

    // 4. Credit winnings to the user's wallet
    if (grossWinAmountCoins > 0) {
      await creditToWallet(user.id, grossWinAmountCoins, `Win from ${gameName}`);
    }

    // 5. Calculate and award XP
    const isWin = grossWinAmountCoins > 0;
    if (user.vipInfo && user.vipInfo[0]) {
      const xpGained = calculateXpForWagerAndWins(wagerAmountCoins / 100, isWin, user.vipInfo[0]);
      if (xpGained > 0) {
        await addXpToUser(user.id, xpGained);
      }
    }

    // 6. Update the cached game session stats
    await updateGameSessionStats(c, {
      totalSpinWinnings: grossWinAmountCoins,
      wagerAmount: wagerAmountCoins,
    });

    // 7. Handle Jackpots
    const jackpotResult = await processJackpots(c, {
      gameSpinId: "temp-spin-id", // This would need to come from a newly created spin record if you persist every spin
      wagerAmountCoins,
      gameCategory: "SLOTS",
      userId: user.id,
    });

    const enhancedResponse = await enhanceRTGResponseWithJackpots(
      gameResultFromDeveloper.result as ProviderSpinResponseData,
      jackpotResult as any,
    );
    gameResultFromDeveloper.result = enhancedResponse;

    // 8. Send a big win notification
    const winAmountInDollars = coinsToDollars(grossWinAmountCoins);
    if (winAmountInDollars > 10) {
      sendNotificationToUser(user.id, {
        title: "Big Win!",
        message: `Congratulations! You won $${winAmountInDollars.toFixed(2)} on ${gameName}!`,
      });
    }

    return gameResultFromDeveloper;
  }
  catch (error) {
    console.error("Error creating Redtiger spin:", error);
    return {
      success: false,
      error: {
        code: "SPIN_FAILED",
        message: error instanceof Error ? error.message : "An unexpected error occurred.",
      },
    };
  }
}

async function enhanceRTGResponseWithJackpots(
  originalResponse: ProviderSpinResponseData,
  jackpotResult: { contributions: { jackpotType: string; contributionAmountCoins: number }[]; jackpotWin: { id: string; jackpotType: string; winAmountCoins: number } | null },
): Promise<ProviderSpinResponseData> {
  const enhancedResponse = { ...originalResponse };

  if (jackpotResult?.contributions?.length > 0) {
    enhancedResponse.jackpots = {
      contributions: jackpotResult.contributions.map((contrib: { jackpotType: string; contributionAmountCoins: number }) => ({
        type: contrib.jackpotType,
        amount: coinsToDollars(contrib.contributionAmountCoins),
        amountCoins: contrib.contributionAmountCoins,
      })),
      totalContribution: coinsToDollars(
        jackpotResult.contributions.reduce((acc: number, contrib: { contributionAmountCoins: number }) => acc + contrib.contributionAmountCoins, 0),
      ),
    };
  }

  if (jackpotResult?.jackpotWin) {
    const jackpotWin = jackpotResult.jackpotWin;

    enhancedResponse.jackpots = {
      ...enhancedResponse.jackpots,
      type: jackpotWin.jackpotType,
      amount: coinsToDollars(jackpotWin.winAmountCoins),
      amountCoins: jackpotWin.winAmountCoins,
      winId: jackpotWin.id,
    };

    if (enhancedResponse.user?.balance?.cash?.atEnd) {
      const currentBalance = Number.parseFloat(enhancedResponse.user.balance.cash.atEnd);
      const newBalance = currentBalance + coinsToDollars(jackpotWin.winAmountCoins);
      enhancedResponse.user.balance.cash.atEnd = newBalance.toFixed(2);
    }

    if (enhancedResponse.game?.win?.total) {
      const currentWin = Number.parseFloat(enhancedResponse.game.win.total);
      const newWin = currentWin + coinsToDollars(jackpotWin.winAmountCoins);
      enhancedResponse.game.win.total = newWin.toFixed(2);
    }
  }

  const eligibleTypes = ["MAJOR", "MINOR", "GRAND"];
  const currentJackpots = await db.query.Jackpot.findMany({
    where: and(inArray(Jackpot.type, eligibleTypes as (typeof Jackpot.type.enumValues[number])[]), eq(Jackpot.isActive, true)),
  });
  (enhancedResponse as ProviderSpinResponseData & { currentJackpots: unknown[] }).currentJackpots = currentJackpots.map((jackpot: JackpotType) => ({
    type: jackpot.type,
    amount: coinsToDollars(jackpot.currentAmountCoins),
    amountCoins: jackpot.currentAmountCoins,
  }));

  return enhancedResponse;
}
