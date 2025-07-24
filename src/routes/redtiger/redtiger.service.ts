import type { User } from "@ngneat/falso";
import type { Context } from "hono";
import type { z } from "zod";

import { and, eq, inArray } from "drizzle-orm";

import type { GameSessionType, JackpotType, NewGameSpin, providerSpinResponseDataSchema, rtgSettingsRequestDtoSchema, rtgSettingsResponseDtoSchema, rtgSpinRequestDtoSchema, rtgSpinResponseDtoSchema, UserWithRelations } from "#/db";

import db from "#/db";
import { GameSession, Jackpot } from "#/db/schema";
import { handleGameSpin } from "#/lib/gameplay";
import { processJackpots } from "#/lib/jackpot";
import { coinsToDollars, dollarsToCoins } from "#/utils/misc.utils";

import { atlantis_settings, atlantis_spin } from "./data";

type ProviderSpinResponseData = z.infer<typeof providerSpinResponseDataSchema>;
type RTGSettingsRequestDto = z.infer<typeof rtgSettingsRequestDtoSchema>;
type RTGSettingsResponseDto = z.infer<typeof rtgSettingsResponseDtoSchema>;
type RTGSpinRequestDto = z.infer<typeof rtgSpinRequestDtoSchema>;
type RTGSpinResponseDto = z.infer<typeof rtgSpinResponseDtoSchema>;

const testing = true;

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
            fingerprint: data.userData?.fingerprint, // "c474d2e1-a19e-4a40-8d32-58b02b0c1034",
            hash: "",
          },
          custom: { siteId: "", extras: "" },
        }),
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      };
      const response = await fetch(
        `https://proxy.andrews.workers.dev/proxy/gserver-rtg.redtiger.com/rtg/platform/game/spin`,
        init,
      );
      gameSettingsFromDeveloper = await response.json();
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
  try {
    const user = c.get("user") as User;
    const gameName = c.get("gameName");
    const gameSessionId = c.get("gameSessionId");
    if (!user) {
      throw new Error("User not authenticated.");
    }

    // const { gameSessionId } = data;
    if (!gameSessionId) {
      throw new Error("gameSessionId is required.");
    }

    const session = await getGameSessionById(c, gameSessionId);
    if (!session) {
      throw new Error("Game session not found");
    }
    let gameResultFromDeveloper: RTGSpinResponseDto;
    if (testing) {
      gameResultFromDeveloper = atlantis_spin;
    }
    else {
      const init = {
        body: JSON.stringify(data),
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
      };
      const response = await fetch(
        `https://proxy.andrews.workers.dev/proxy/gserver-rtg.redtiger.com/rtg/platform/game/spin`,
        init,
      );
      gameResultFromDeveloper = await response.json();
    }
    if (!gameResultFromDeveloper.success) {
      return gameResultFromDeveloper;
    }

    const spinData: NewGameSpin = {
      sessionId: gameSessionId as string,
      spinData: gameResultFromDeveloper as unknown,
      userId: user.id,
      wagerAmount: dollarsToCoins(Number.parseFloat(gameResultFromDeveloper.result!.game.stake)),
      grossWinAmount: dollarsToCoins(Number.parseFloat(gameResultFromDeveloper.result!.game.win.total)),
      gameName: gameName as string,
      spinNumber: 0,
      occurredAt: new Date(),
    };

    const gameSpin = await handleGameSpin(c, spinData, {
      totalSpinWinnings: spinData.grossWinAmount!,
      wagerAmount: spinData.wagerAmount!,
    });

    const jackpotResult = await processJackpots(c, {
      gameSpinId: gameSpin.id as string,
      wagerAmountCoins: spinData.wagerAmount as number,
      gameCategory: "SLOTS",
      userId: user.id,
    });

    const enhancedResponse = await enhanceRTGResponseWithJackpots(
      gameResultFromDeveloper.result as ProviderSpinResponseData,
      jackpotResult as any,
    );

    gameResultFromDeveloper.result = enhancedResponse;

    return gameResultFromDeveloper;
  }
  catch (error) {
    console.error("Error creating Redtiger spin:", error);
    throw new Error("Could not create Redtiger spin");
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
  // const currentJackpots = await db.query.Jackpot.findMany({
  //   where: (jackpots, { inArray, eq }) => and(inArray(jackpots.type, eligibleTypes), eq(jackpots.isActive, true)),
  // });
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
