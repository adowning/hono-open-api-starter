import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { BunSQLQueryResultHKT } from "drizzle-orm/bun-sql";
import type { PgTransaction } from "drizzle-orm/pg-core";

import { eq } from "drizzle-orm";

import type { VipInfoType } from "#/db";
import type * as schema from "#/db/schema"; // Import the full schema object

import db, { User, VipInfo } from "#/db";

import { getVipLevelByTotalXp, getVipLevelConfiguration } from "./vip.config";

// Define a reusable type for the Bun PostgreSQL transaction object
type Transaction = PgTransaction<BunSQLQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

// This interface defines the results of an XP calculation
export interface XpCalculationResult {
  xpGained: number;
  newTotalXp: number;
  newCurrentLevelXp: number;
  levelChanged: boolean;
  newLevel: number;
  oldLevel: number;
}

/**
 * Calculates XP gained from wagers and wins based on VIP level.
 */
export function calculateXpForWagerAndWins(wagerAmount: number, isWin: boolean, vipInfo: VipInfoType): number {
  const baseXp = Math.floor(wagerAmount);
  const levelConfig = getVipLevelConfiguration(vipInfo.level);
  const multiplier = levelConfig?.dailyBonusMultiplier || 1.0;

  return isWin ? Math.floor(baseXp * multiplier * 2) : Math.floor(baseXp * multiplier);
}

/**
 * Adds XP to a user and handles level progression within a single database transaction.
 */
export async function addXpToUser(userId: string, xpAmount: number): Promise<XpCalculationResult> {
  if (xpAmount <= 0) {
    throw new Error("XP amount must be positive");
  }

  return await db.transaction(async (tx) => {
    const vipInfoResult = await tx.select().from(VipInfo).where(eq(VipInfo.userId, userId)).limit(1);
    let vipInfo = vipInfoResult[0];

    if (!vipInfo) {
      vipInfo = await createDefaultVipInfo(userId, tx);
    }

    const oldLevel = vipInfo.level;
    const oldTotalXp = vipInfo.totalXp;
    const newTotalXp = oldTotalXp + xpAmount;

    const newLevelConfig = getVipLevelByTotalXp(newTotalXp);
    const newLevel = newLevelConfig.level;
    const newCurrentLevelXp = newTotalXp - newLevelConfig.cumulativeXpToReach;

    await tx.update(VipInfo).set({
      totalXp: newTotalXp,
      level: newLevel,
      xp: newCurrentLevelXp,
    }).where(eq(VipInfo.userId, userId));

    const result: XpCalculationResult = {
      xpGained: xpAmount,
      newTotalXp,
      newCurrentLevelXp,
      levelChanged: oldLevel !== newLevel,
      newLevel,
      oldLevel,
    };

    if (result.levelChanged) {
      await applyLevelUpBenefits(userId, newLevel, tx);
    }

    return result;
  });
}

/**
 * Creates default VIP information for a new user.
 */
async function createDefaultVipInfo(userId: string, tx: Transaction): Promise<VipInfoType> {
  const users = await tx.select().from(User).where(eq(User.id, userId)).limit(1);
  const user = users[0];

  if (!user) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  const [newVipInfo] = await tx.insert(VipInfo).values({
    userId,
    level: 1,
    xp: 0,
    totalXp: 0,
  }).returning();

  return newVipInfo;
}

/**
 * Applies benefits when a user levels up.
 */
async function applyLevelUpBenefits(userId: string, newLevel: number, tx: Transaction): Promise<void> {
  const levelConfig = getVipLevelConfiguration(newLevel);
  if (!levelConfig)
    return;

  await tx.update(VipInfo).set({
    // You can add more fields to update here, like cashbackPercentage
  }).where(eq(VipInfo.userId, userId));

  // Here you can add logic to grant level-up rewards, send notifications, etc.
  console.log(`User ${userId} has reached level ${newLevel}! Applying benefits.`);
}
