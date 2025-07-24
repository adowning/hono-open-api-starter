import type { Context, Next } from "hono";

import { getGameSessionFromCache, saveGameSessionToCache } from "#/lib/cache";
import { endAndPersistGameSession } from "#/lib/sessions";

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export async function sessionMiddleware(c: Context, next: Next) {
  const authSession = c.get("authSession");
  const user = c.get("user");

  if (!authSession) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  const gameSession = getGameSessionFromCache(user.currentGameSessionDataId);

  if (gameSession) {
    // Due to cache corruption, the gameSession.id may not be a string.
    // We fall back to the authSession.id which is reliable.
    // if (typeof gameSession.id !== "string") {
    //   gameSession.id = authSession.id;
    // }

    const now = new Date();
    // `lastSeen` is a cache-only property not in the DB schema for GameSession.
    // It's manually added to the session object stored in the cache.
    const lastSeenValue = (gameSession as any).lastSeen;
    const lastSeen = lastSeenValue ? new Date(lastSeenValue) : now;
    const timeDiff = now.getTime() - lastSeen.getTime();

    if (timeDiff > IDLE_TIMEOUT) {
      // Session has expired, end it and remove from cache.
      // Ensure gameSession.id is a string before passing to endAndPersistGameSession
      const sessionId = typeof gameSession.id === "string" ? gameSession.id : authSession.id;
      await endAndPersistGameSession(sessionId);
      c.set("gameSession", null);
    }
    else {
      // Session is active, update the lastSeen timestamp and save back to cache.
      (gameSession as any).lastSeen = now;
      await saveGameSessionToCache(gameSession, c);
    }
  }

  await next();
}
