// import type { InferSelectModel } from "drizzle-orm";
// import type { Context } from "hono";

// import chalk from "chalk";
// import { and, eq } from "drizzle-orm";

// import db, { AuthSession, Game, GameSession, GameSpin } from "#/db/schema"; // Adjust path as needed
// import { deleteGameSessionFromCache, deleteSpinsFromCache, getGameSessionFromCache, getSpinsFromCache, saveGameSessionToCache } from "#/lib/cache";
// import { nanoid } from "#/utils/nanoid";

// // --- Drizzle Schema Imports ---
// // import { processXpGains } from "../vipInfo/vipinfo.service";

// // The type for a game session is now inferred from the Drizzle schema
// type GameSessionType = InferSelectModel<typeof GameSession>;

// export async function startSession(c: Context, gameName: string): Promise<GameSessionType> {
//   const user = c.get("user");

//   if (!user) {
//     throw new Error("User not authenticated.");
//   }
//   console.log(chalk.bgCyan("Starting new session for user:", user.id));

//   // 1. Find the user's currently active authentication session.
//   const activeAuthSession = await db.query.AuthSession.findFirst({
//     where: and(eq(AuthSession.userId, user.id), eq(AuthSession.status, "ACTIVE")),
//   });

//   if (!activeAuthSession) {
//     throw new Error("No active authentication session found for user.");
//   }
//   const game = await db.select().from(Game).where(eq(Game.name, gameName));
//   // 2. Ensure any previous game session is properly ended before starting a new one.
//   await endCurrentGameSession(user.id);

//   // 3. Validate the gameId
//   const gameId = game[0].id || "lobby";
//   if (gameId !== "lobby") {
//     const game = await db.query.Game.findFirst({ where: eq(Game.id, gameId) });
//     if (!game) {
//       throw new Error(`Game with ID "${gameId}" not found.`);
//     }
//   }

//   // 4. Create the new game session record in the database
//   const newSessionData: GameSessionType = {
//     id: nanoid(),
//     userId: user.id,
//     authSessionId: activeAuthSession.id,
//     gameId,
//     status: "ACTIVE",
//     createdAt: new Date(),
//     endedAt: null,
//     duration: 0,
//     totalWagered: 0,
//     totalWon: 0,
//     rtp: null,
//     totalXpGained: 0,
//   };

//   await db.insert(GameSession).values(newSessionData);

//   // 5. Save the new session to the cache for fast access during gameplay
//   await saveGameSessionToCache(newSessionData, c);

//   return newSessionData;
// }

// export async function endCurrentGameSession(userId: string): Promise<void> {
//   const activeSession = await db.query.GameSession.findFirst({
//     where: and(eq(GameSession.userId, userId), eq(GameSession.status, "ACTIVE")),
//   });

//   if (!activeSession) {
//     return; // No active game session to end.
//   }

//   console.log(chalk.bgBlue("Ending session and persisting data for session:", activeSession.id));

//   // Retrieve the final state of its spins from the cache.
//   const sessionSpins = await getSpinsFromCache(activeSession.id);

//   // Use the final cached state of the session if available, otherwise use the DB state
//   const sessionFromCache = await getGameSessionFromCache(activeSession.id) || activeSession;

//   await db.transaction(async (tx) => {
//     const now = new Date();
//     const finalRtp = sessionFromCache.totalWagered > 0 ? (sessionFromCache.totalWon / sessionFromCache.totalWagered) * 100 : 0;
//     const duration = Math.round((now.getTime() - new Date(sessionFromCache.createdAt).getTime()) / 1000);

//     // 1. Persist the final GameSession record state.
//     await tx.update(GameSession).set({
//       status: "COMPLETED",
//       endedAt: now,
//       duration,
//       totalWagered: sessionFromCache.totalWagered,
//       totalWon: sessionFromCache.totalWon,
//       totalXpGained: sessionFromCache.totalXpGained,
//       rtp: finalRtp.toFixed(2),
//     }).where(eq(GameSession.id, activeSession.id));

//     // 2. Persist all GameSpins from the session, if any exist.
//     if (sessionSpins.length > 0) {
//       const spinsToCreate = sessionSpins.map((spin, i) => ({
//         ...spin,
//         gameSessionId: activeSession.id, // Link spin to the session
//         sessionId: activeSession.id,
//         spinNumber: i + 1,
//         timeStamp: new Date(spin.createdAt ?? Date.now()),
//         grossWinAmount: spin.grossWinAmount ?? 0,
//         wagerAmount: spin.wagerAmount ?? 0,
//         occurredAt: spin.occurredAt ?? new Date(),
//       }));
//       await tx.insert(GameSpin).values(spinsToCreate);
//     }

//     // 3. Call the VIP service to process all accumulated XP for the session.
//     if (sessionFromCache.totalXpGained > 0) {
//       // await processXpGains(c, tx, userId, sessionFromCache.totalXpGained);
//     }
//   });

//   // After the transaction succeeds, clean up the session data from the cache.
//   await deleteGameSessionFromCache(activeSession.id);
//   await deleteSpinsFromCache(activeSession.id);
// }

// /**
//  * Retrieves a game session by its ID.
//  * Checks the cache first, then falls back to the database.
//  * @param c The Hono context.
//  * @param sessionId The ID of the game session to retrieve.
//  * @returns A promise resolving to the session data or null if not found.
//  */
// export async function getSession(c: Context, sessionId: string): Promise<GameSessionType | null> {
//   try {
//     // 1. Check cache first
//     const session = await getGameSessionFromCache(sessionId);
//     if (session) {
//       return session;
//     }

//     // 2. Fallback to database
//     const dbSession = await db.query.GameSession.findFirst({
//       where: eq(GameSession.id, sessionId),
//       with: { user: true }, // Eager load user if needed elsewhere
//     });

//     if (!dbSession) {
//       return null;
//     }

//     // 3. Save the retrieved session to cache for subsequent requests
//     await saveGameSessionToCache(dbSession, c);
//     return dbSession;
//   }
//   catch (error) {
//     console.error(`Error getting session ${sessionId}:`, error);
//     return null;
//   }
// }

// /**
//  * Force-closes a session by ID, updating its status and totals.
//  * This is a direct DB operation intended for explicit closure calls.
//  * @param c The Hono context.
//  * @param sessionId The ID of the session to close.
//  */
// export async function closeSession(c: Context, sessionId: string): Promise<void> {
//   const session = await getGameSessionFromCache(sessionId); // Use cached data for final values

//   if (!session) {
//     console.warn(`Attempted to close session ${sessionId}, but it was not found in cache. The session may not be persisted correctly.`);
//     return;
//   }

//   try {
//     const now = new Date();
//     const duration = Math.round((now.getTime() - new Date(session.createdAt).getTime()) / 1000);

//     await db.update(GameSession).set({
//       status: "COMPLETED",
//       endedAt: now,
//       duration,
//       totalWagered: session.totalWagered,
//       totalWon: session.totalWon,
//       rtp: session.rtp,
//       totalXpGained: session.totalXpGained,
//     }).where(eq(GameSession.id, sessionId));
//   }
//   catch (error) {
//     console.error("Error saving session to database:", error);
//     throw error;
//   }
//   finally {
//     await deleteGameSessionFromCache(sessionId);
//     await deleteSpinsFromCache(sessionId);
//   }
// }

// /**
//  * Deletes a session from the cache.
//  * @param sessionId The ID of the session to delete.
//  */
// export async function deleteSession(sessionId: string): Promise<void> {
//   try {
//     await deleteGameSessionFromCache(sessionId);
//     await deleteSpinsFromCache(sessionId);
//   }
//   catch (error) {
//     console.error(`Error deleting session ${sessionId} from cache:`, error);
//     throw error;
//   }
// }
