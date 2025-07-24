import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { sql } from "drizzle-orm";

import type * as schema from "../../src/db/schema";

const tableNames = [
  "wallets",
  "products",
  // "user_achievements",
  // "invite_commission_history",
  // "invite_stats",
  // "user_rewards",
  // 'vip_times_history',
  // "vip_level_reward_history",
  // "vip_rebate_history",
  // "vip_tasks",
  // "invite_history",
  // "game_big_wins",
  "game_history",
  // "chat_messages",
  // "statistics",
  // "live_wins",
  // "explain_items",
  // "achievement_items",
  // "promos",
  // "invites",
  // "achievements",
  // "withdrawals",
  // "deposits",
  // "transactions",
  // "messages",
  // "vips",
  // "promo_groups",
  "game_sessions",
  "auth_sessions",
  "games",
  // "game_categories",
  // "balances",
  // "bonuses",
  // "rewards",
  // "vip_signin_awards",
  // "vip_level_awards",
  // "countries",
  // "languages",
  // "currencies",
  // "announcements",
  // "banners",
  "vip_levels",
  "users",
  "operators",
  "vip_info",
];

export async function resetDatabase(db: NodePgDatabase<typeof schema>) {
  console.log("🗑️  Resetting database...");

  const truncateQuery = `TRUNCATE TABLE ${tableNames.map(name => `"${name}"`).join(", ")} RESTART IDENTITY CASCADE;`;

  try {
    await db.execute(sql.raw(truncateQuery));
    console.log("✅ Database reset successfully.");
  }
  catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}
