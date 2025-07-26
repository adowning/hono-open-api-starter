import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type * as schema from "../../src/db/schema";

import { VipLevel } from "../../src/db/schema";

const levels = [
  {
    level: 1,
    name: "Bronze",
    xpForNext: 1000,
  },
  {
    level: 2,
    name: "Silver",
    xpForNext: 5000,
  },
  {
    level: 3,
    name: "Gold",
    xpForNext: 20000,
  },
  {
    level: 4,
    name: "Platinum",
    xpForNext: 100000,
  },
  {
    level: 5,
    name: "Diamond",
    xpForNext: 500000,
  },
];

export async function seedVipLevels(db: NodePgDatabase<typeof schema>) {
  console.log("💎 Seeding VIP levels...");
  await db.insert(VipLevel).values(levels).onConflictDoNothing();
  console.log("✅ VIP levels seeded.");
  return levels;
}