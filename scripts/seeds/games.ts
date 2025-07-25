/* eslint-disable ts/ban-ts-comment */
/**
 * HOW TO USE THIS SCRIPT:
 * --------------------------
 * 1.  **Save the file**: Save this code as `seed.ts` in a `scripts` directory at the root of your Drizzle project.
 *
 * 2.  **Place JSON data**: Make sure the `games2.json` file is also in the `scripts` directory.
 *
 * 3.  **Check Dependencies**: Ensure you have `drizzle-orm`, `postgres`, and `dotenv` installed. If not, run:
 * npm install drizzle-orm postgres dotenv
 * npm install -D @types/node ts-node
 *
 * 4.  **Environment Variables**: The script uses `dotenv` to load database credentials from a `.env` file in your project root.
 * Your `.env` file should look something like this:
 *
 * DATABASE_URL="postgres://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT/YOUR_DB"
 *
 * 5.  **Adjust Paths**: The script assumes your Drizzle schema file is located at `../src/db/schema.ts` relative to the `scripts` directory.
 * If your schema file is located elsewhere, you'll need to update the import path for `gamesTable`.
 *
 * 6.  **Run the script**: Execute the script from your project's root directory using ts-node:
 * npx ts-node scripts/seed.ts
 *
 * --------------------------
 */

import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as fs from "node:fs";
import * as path from "node:path";
import "dotenv/config";

import type * as schema from "../../src/db/schema";

import { Game as gamesTable } from "../../src/db/schema"; // Adjust this path to your actual schema file
// Type definition for the raw game data from the JSON file.
interface RawGame {
  id: string;
  developer: string;
  provider?: string;
  type: string;
  name: string;
  title: string;
  gamebank: string;
  statIn?: string;
  statOut?: string;
  [key: string]: any; // Allows for other properties
}

// Main function to run the seeding process
export async function seedGames(db: NodePgDatabase<typeof schema>) { // Check for the DATABASE_URL environment variable.
  // Create a database connection using postgres.js

  console.log("🌱 Seeding database...");

  // Construct the path to the JSON file
  const jsonPath = path.join(__dirname, "/json/games2.json");

  // Read and parse the JSON file
  const gamesData: RawGame[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // Transform the raw JSON data to match the Drizzle schema.
  const transformedGames = gamesData.map((game) => {
    // Determine the category. 'fish' seems to be indicated by gamebank.
    // Default to 'slots' if type is 'slots', otherwise 'other'.
    const category = game.gamebank;

    // Use provider if available, otherwise fallback to developer.
    const providerName = game.provider || game.developer;

    return {
      ...game,
      name: game.name,
      title: game.title,
      // Store the original, unaltered JSON object for reference.
      goldsvetData: game,
      // Map the category based on the logic above.
      category,
      // The schema requires tags, so we provide an empty array as a default.
      tags: [game.type],
      // Use the provider name from the data.
      providerName: providerName.toUpperCase(),
      // The `id` from the JSON seems to be the provider's unique ID for the game.
      providerId: game.id,
      // Parse statIn and statOut as numbers, defaulting to 0 if invalid or missing.
      totalWagered: Math.floor(Number.parseFloat(game.statIn || "0")),
      totalWon: Math.floor(Number.parseFloat(game.statOut || "0")),
    };
  });

  console.log(`✅ Transformed ${transformedGames.length} games for seeding.`);

  try {
    // Insert the transformed data into the 'games' table.
    // Drizzle ORM's insert method can handle an array of objects directly.
    // @ts-ignore
    await db.insert(gamesTable).values(transformedGames).onConflictDoNothing();

    console.log("✅ Database seeded successfully!");
  }
  catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Execute the main function and handle any top-level errors.

// /* eslint-disable ts/ban-ts-comment */
// import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// import type * as schema from "../../src/db";

// import { games } from "../../src/db";
// import * as rawgames from "./json/games2.json";

// const GAMES: any[] = [];
// // @ts-ignore
// for (const game of rawgames.default) {
//   game.category = game.gamebank || game.type;
//   game.tags = game.gamebank || game.type;
//   GAMES.push(game);
// }
// // rawgames.forEach((game) => {
// // })
// export async function seedGames(db: NodePgDatabase<typeof schema>) {
//   console.log("🎮 Seeding games and categories...");

//   // const createdCategories = await db
//   //   .insert(gameCategories)
//   //   .values(CATEGORIES)
//   //   .returning();

//   const gamesToInsert = GAMES.map(game => ({
//     ...game,
//     // categoryId: rand(createdCategories).id,
//   }));
//   console.log(gamesToInsert);
//   // await db.insert(games).values(GAMES).onConflictDoNothing();

//   console.log("✅ Games and categories seeded.");
// }
