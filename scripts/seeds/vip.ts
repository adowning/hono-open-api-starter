import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { randNumber } from "@ngneat/falso";
import { sql } from "drizzle-orm";

import type * as schema from "../../src/db";

import { User, VipInfo, VipLevel } from "../../src/db";

const levels = [
  {
    level: 1,
    name: "Bronze",
    depositExp: 1000,
    betExp: 5000,
    uprankAward: 100,
    weekAward: 10,
  },
  {
    level: 2,
    name: "Silver",
    depositExp: 5000,
    betExp: 25000,
    uprankAward: 500,
    weekAward: 50,
  },
  {
    level: 3,
    name: "Gold",
    depositExp: 20000,
    betExp: 100000,
    uprankAward: 2000,
    weekAward: 200,
  },
  {
    level: 4,
    name: "Platinum",
    depositExp: 100000,
    betExp: 500000,
    uprankAward: 10000,
    weekAward: 1000,
  },
  {
    level: 5,
    name: "Diamond",
    depositExp: 500000,
    betExp: 2500000,
    uprankAward: 50000,
    weekAward: 5000,
  },
];

interface VipInfoSeed {
  userId: string;
  level: number;
  depositExp: number;
  betExp: number;
  rankBetExp: number;
  rankDepositExp: number;
  freeSpinTimes: number;
  weekGift: number;
  monthGift: number;
  upgradeGift: number;
  nowCashBack: number;
  yesterdayCashBack: number;
  historyCashBack: number;
}

function generateRandomVipInfo(userId: string): VipInfoSeed {
  const level = randNumber({ min: 0, max: 5 });
  const baseExp = level * 1000;
  const depositExp = randNumber({ min: baseExp, max: baseExp * 10 });
  const betExp = randNumber({ min: baseExp * 5, max: baseExp * 50 });
  return {
    userId,
    level,
    depositExp,
    betExp,
    rankBetExp: randNumber({ min: 0, max: betExp }),
    rankDepositExp: randNumber({ min: 0, max: depositExp }),
    freeSpinTimes: randNumber({ min: 0, max: 20 }),
    weekGift: randNumber({ min: 0, max: 2 }),
    monthGift: randNumber({ min: 0, max: 1 }),
    upgradeGift: randNumber({ min: 0, max: 1 }),
    nowCashBack: randNumber({ min: 0, max: 1000 }),
    yesterdayCashBack: randNumber({ min: 0, max: 1000 }),
    historyCashBack: randNumber({ min: 0, max: 5000 }),
  };
}

export async function seedVipLevels(db: NodePgDatabase<typeof schema>) {
  console.log("💎 Seeding VIP levels...");
  await db.insert(VipLevel).values(levels.map(l => ({ ...l, xpForNext: 0 }))).onConflictDoNothing();
  console.log("✅ VIP levels seeded.");

  console.log("💎 Seeding VIP info for users...");
  // Get all users who don't have vipInfo yet
  const usersWithoutVipInfo = await db
    .select({ id: User.id })
    .from(User)
    .leftJoin(VipInfo, sql`${User.id} = ${VipInfo.userId}`)
    .where(sql`${VipInfo.userId} IS NULL`);

  console.log(`Found ${usersWithoutVipInfo.length} users without VIP info`);

  // Generate and insert vipInfo for each user
  const vipInfoRecords = usersWithoutVipInfo.map(user =>
    generateRandomVipInfo(user.id),
  );

  if (vipInfoRecords.length > 0) {
    await db.insert(VipInfo).values(vipInfoRecords.map(v => ({ ...v, xp: 0, totalXp: 0 })));
    console.log(`✅ VIP info created for ${vipInfoRecords.length} users`);
  }
  else {
    console.log("ℹ️  All users already have VIP info");
  }

  // Update existing users with random data (optional, uncomment if needed)
  // const allUsers = await db.select().from(users)
  // const updatePromises = allUsers.map((user) =>
  //   db.update(vipInfo)
  //     .set(generateRandomVipInfo(user.id))
  //     .where(sql`${vipInfo.userId} = ${user.id}`)
  // )
  // await Promise.all(updatePromises)
  // console.log(`✅ VIP info updated for ${allUsers.length} users`)

  return levels;
}
