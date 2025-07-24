/* eslint-disable ts/ban-ts-comment */
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../../src/db/schema";

// This is the single, hardcoded operator for the entire system.
// Using a deterministic ID makes it easy to reference in other seeds.
const defaultOperator = {
  id: "clxjv0w2z0000356s1szacrqs",
  name: "Default Operator",
  operatorSecret: crypto.randomUUID(),
  balance: 10000,
  netRevenue: 0,
  operatorAccess: crypto.randomUUID(),
  callbackUrl: "https://example.com/callback",
  allowedIps: ["0.0.0.0/0"], // Allows all IPs for dev purposes
  acceptedPayments: ["INSTORE_CASH", "INSTORE_CARD"],
};

export async function seedOperator(db: NodePgDatabase<typeof schema>) {
  console.log("🏢 Seeding default operator...");

  // onConflictDoNothing prevents errors if the operator already exists.
  await db.insert(schema.Operator)
  // @ts-ignore
    .values(defaultOperator)
    .onConflictDoNothing();

  console.log("✅ Default operator seeded.");
  // Return the operator object so its ID can be used in other seeds.
  return defaultOperator;
}
