import type { Context } from "hono";
import type { z } from "zod";

import chalk from "chalk";

import type { createSessionDataSchema } from "@/generated/sessionData/schema";
import type { NewGameSpin } from "#/db";

import { deleteSessionFromCache, deleteSpinsFromCache, getSessionFromCache, getSpinsFromCache, saveSessionToCache } from "@/libs/cache";
import { isDecimal } from "@/utils/misc.utils";
import { nanoid } from "@/utils/nanoid";
import db from "#/db";
import { GameSession, GameSpin } from "#/db/schema";
import { deleteGameSessionFromCache, deleteSpinsFromCache, getGameSessionFromCache, getSpinsFromCache } from "#/lib/cache";

import type { SessionData } from "../../generated/client";

import { Prisma } from "../../generated/client";
import { getPrismaClient } from "../common";
import { processXpGains } from "../vipInfo/vipinfo.service";

type CreateSessionDataInput = z.infer<typeof createSessionDataSchema>;

/**
 * Starts a new game session for a user.
 * This function creates an in-memory session record and sets it as the user's current session.
 * @param c The Hono context.
 * @param data The input data, containing the gameId.
 * @returns A promise resolving to the newly created session data.
 */
export async function startSession(c: Context<Env>, data?: CreateSessionDataInput): Promise<SessionData> {
  // console.log(chalk.bgCyan('Starting new session...'))
  const prisma = getPrismaClient(c);

  const user = c.get("user");
  if (!data) {
    data = {
      gameId: "lobby",
      userId: user.id,
      spinIds: [],
    };
  }
  if (!user) {
    throw new Error("User not authenticated.");
  }
  console.log(chalk.bgCyan("Starting new session for user:", user.id));

  // Ensure any previous session is properly ended and persisted before starting a new one.
  await endCurrentSessionData(c, user.id);
  let game;
  if (data.gameId && data.gameId !== "lobby")
    game = await prisma.game.findUnique({ where: { id: data.gameId } });
  if (!game || data.gameId == "lobby") {
    // throw new Error(`Game with ID "${data.gameId}" not found.`);
    game = {
      id: "lobby",
    };
  }

  // const newSessionId = nanoid()// || `sid_${new Date().getTime()}_${Math.random().toString(36).substring(2, 10)}`;
  const newSession: SessionData = {
    id: user.id,
    userId: user.id,
    gameId: game.id || "lobby",
    createdAt: new Date(),
    updatedAt: new Date(),
    duration: 0,
    ipAddress: null,
    totalWagered: 0,
    totalWon: 0,
    endAt: null,
    rtp: null,
    spinIds: [],
    status: "ACTIVE",
    userAgent: c.req.header("User-Agent") || null,
    deviceId: null,
    totalXpGained: 0,
    currentBalance: 0,
  };

  await saveSessionToCache(newSession, c);
  // await prisma.user.update({
  //   where: { id: user.id },
  //   data: { currentSessionDataId: newSessionId },
  // });

  return newSession;
}

/**
 * Ends a user's current game session.
 * This function acts as an orchestrator, retrieving all in-memory data for the session
 * and persisting it to the database in a single, atomic transaction.
 * @param c The Hono context.
 * @param userId The ID of the user whose session is ending.
 */
export async function endCurrentSessionData(c: Context<Env>, userId: string): Promise<void> {
  const prisma = getPrismaClient(c);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.currentSessionDataId) {
    return; // No active session to end.
  }

  console.log(chalk.bgBlue("Ending session and persisting data for user:", user.id));
  const sessionId = user.currentSessionDataId;

  // Retrieve the final state of the session and its spins from the cache.
  const session = await getSessionFromCache(sessionId);
  const sessionSpins = await getSpinsFromCache(sessionId);

  if (session) {
    // --- WRAP ALL DATABASE WRITES IN A SINGLE TRANSACTION ---
    await prisma.$transaction(async (tx) => {
      const spinCount = sessionSpins.length;
      const finalRtp = session.totalWagered > 0 ? (session.totalWon / session.totalWagered) * 100 : 0;
      const now = new Date();

      // 1. Persist the final SessionData record.
      await tx.sessionData.upsert({
        where: { id: session.id },
        update: {
          endAt: now,
          duration: (now.getTime() - session.createdAt.getTime()) / 1000,
          totalWagered: session.totalWagered,
          totalWon: session.totalWon,
          spinIds: sessionSpins.map(s => s.id!).filter(Boolean),
        },
        create: {
          id: session.id,
          createdAt: session.createdAt,
          endAt: now,
          duration: (now.getTime() - session.createdAt.getTime()) / 1000,
          totalWagered: session.totalWagered,
          totalWon: session.totalWon,
          rtp: finalRtp,
          userId,
          gameId: session.gameId,
          spinIds: sessionSpins.map(s => s.id!).filter(Boolean),
        },
      });

      // 2. Persist all GameSpins from the session, if any exist.
      if (spinCount > 0) {
        const spinsToCreate = sessionSpins.map((s: { createdAt?: string | number | Date }, i: number) => ({
          ...s,
          spinNumber: i + 1,
          timeStamp: new Date(s.createdAt ?? Date.now()), // Use createdAt from the spin object or fallback to now
        }));
        await tx.gameSpin.createMany({ data: spinsToCreate as any });
      }

      // 3. Call the VIP service to process all accumulated XP for the session.
      if (session.totalXpGained > 0) {
        await processXpGains(c, tx as any, userId, session.totalXpGained);
      }
    });
    // --- END TRANSACTION ---

    // After the transaction succeeds, clean up the session data from the cache.
    await deleteSessionFromCache(sessionId);
    await deleteSpinsFromCache(sessionId);
  }

  // Finally, clear the user's current session ID to indicate they are no longer in a session.
  await prisma.user.update({
    where: { id: userId },
    data: { currentSessionDataId: null },
  });
}

export async function getSession(c: Context<Env>, sessionId: string): Promise<SessionData | null> {
  const prisma = getPrismaClient(c);
  try {
    let session = await getSessionFromCache(sessionId);
    if (!sessionId) {
      sessionId = "lobby";
    }
    if (!session) {
      const dbSession = await prisma.sessionData.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });
      if (!dbSession)
        return null;
      const sessionData: SessionData = {
        id: dbSession.id,
        status: dbSession.status,
        createdAt: dbSession.createdAt,
        updatedAt: dbSession.updatedAt,
        endAt: dbSession.endAt,
        userId: dbSession.userId,
        duration: dbSession.duration,
        totalWagered: dbSession.totalWagered,
        totalWon: dbSession.totalWon,
        spinIds: dbSession.spinIds,
        totalXpGained: dbSession.totalXpGained,
        gameId: dbSession.gameId,
        ipAddress: dbSession.ipAddress,
        userAgent: dbSession.userAgent,
        deviceId: dbSession.deviceId,
        rtp: null,
        currentBalance: 0,
      };
      await saveSessionToCache(sessionData, {} as Context);
      return sessionData;
    }
    if (session.rtp !== null && isDecimal(session.rtp)) {
      session.rtp = new Prisma.Decimal(session.rtp.toNumber());
    }
    else if (session.rtp !== null && typeof session.rtp === "string") {
      session.rtp = new Prisma.Decimal(Number.parseFloat(session.rtp));
    }
    // @ts-ignore
    return session;
  }
  catch (error) {
    console.error(`Error getting session ${sessionId}:`, error);
    return null;
  }
}

export async function closeSession(c: Context<Env>, sessionId: string): Promise<void> {
  const prisma = getPrismaClient(c);
  const session = await getSession(c, sessionId);
  if (!session)
    return;
  try {
    await prisma.$executeRaw`
      UPDATE "SessionData"
      SET 
        status = 'COMPLETED'::"SessionStatus",
        "endAt" = NOW(),
        "updatedAt" = NOW(),
        duration = EXTRACT(EPOCH FROM (NOW() - "createdAt"))::int,
        "totalWagered" = ${session.totalWagered},
        "totalWon" = ${session.totalWon},
        rtp = ${session.rtp !== null ? new Prisma.Decimal(session.rtp) : null},
        "totalXpGained" = ${session.totalXpGained},
        "spinIds" = ${session.spinIds}::text[]
      WHERE id = ${sessionId}
    `;
    await deleteSessionFromCache(sessionId);
  }
  catch (error) {
    console.error("Error saving session to database:", error);
    throw error;
  }
  finally {
    try {
      await deleteSessionFromCache(sessionId);
    }
    catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
      throw error;
    }
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await deleteSessionFromCache(sessionId);
  }
  catch (error) {
    console.error(`Error deleting session ${sessionId} from cache:`, error);
    throw error;
  }
}
export async function endAndPersistGameSession(gameSessionId: string) {
  const sessionToPersist = getGameSessionFromCache(gameSessionId);
  if (!sessionToPersist) {
    console.log(`Session ${gameSessionId} not found in cache. Nothing to persist.`);
    return;
  }

  const spinsToPersist = await getSpinsFromCache(gameSessionId);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(GameSession).values(sessionToPersist);
      if (spinsToPersist.length > 0) { // Cast to InsertGameSpin[] to satisfy Drizzle's type requirements
        await tx.insert(GameSpin).values(spinsToPersist as unknown as NewGameSpin[]);
      }
    });

    await deleteGameSessionFromCache(gameSessionId);
    await deleteSpinsFromCache(gameSessionId);

    console.log(`Session ${gameSessionId} and ${spinsToPersist.length} spins persisted to database and removed from cache.`);
  }
  catch (error) {
    console.error(`Failed to persist session ${gameSessionId}:`, error);
  }
}
