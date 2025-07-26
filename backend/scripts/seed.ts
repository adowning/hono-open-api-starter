import chalk from "chalk";

import db from "../src/db";
import { seedGames } from "./seeds/games";
import { seedGameSpins } from "./seeds/gamespins"; // 1. Import the new seeder
import { seedOperator } from "./seeds/operator";
import { seedProducts } from "./seeds/products";
import { resetDatabase } from "./seeds/reset";
import { seedHardcodedUser, seedUsers } from "./seeds/users";
import { seedVipLevels } from "./seeds/vip";

// --- Script Configuration ---
const RESET_DATABASE = true;
const USER_COUNT = 10;
// --- End Configuration ---

async function main() {
  console.log(chalk.blue("🚀 Starting database seeding process..."));
  const startTime = Date.now();

  try {
    if (RESET_DATABASE) {
      await resetDatabase(db as any);
    }

    // 1. Seed foundational data that has no dependencies
    const operator = await seedOperator(db as any);
    await seedVipLevels(db as any);
    await seedGames(db as any);

    // 2. Seed data that depends on the operator
    await seedProducts(db as any, operator.id);

    // 3. Seed users, which now depend on the operator for their wallets
    await seedUsers(db as any, USER_COUNT, operator.id);
    await seedHardcodedUser(db as any, operator.id);
    // 4. Ensure all users have VIP info (run this after users are created)
    await seedVipLevels(db as any);

    // 4. Seed transactional data that depends on users and games
    await seedGameSpins(db as any); // 2. Call the new seeder function
  }
  catch (error) {
    console.error("❌ An error occurred during the seeding process:");
    console.error(error);
    process.exit(1);
  }
  // finally {
  //   // Ensure the database connection is closed to prevent hanging processes
  //   // await connection.
  //   console.log(chalk.blue('seeding complete'))
  // }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  console.log(`\n✅ Seeding complete in ${duration.toFixed(2)} seconds.`);
  process.exit(0);
}

main();
