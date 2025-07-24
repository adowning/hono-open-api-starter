import type { Context } from "hono";

import type { UserWithRelations } from "#/db";

import {
  rtgSettingsRequestDtoSchema,
  rtgSpinRequestDtoSchema,
} from "#/db";
import { SessionManager } from "#/lib/session.manager";

import {
  createRedtigerSettings,
  createRedtigerSpin,
} from "./redtiger.service";

export const redtigerController = {
  settings: async (c: Context) => {
    const body = await c.req.json();
    const data = rtgSettingsRequestDtoSchema.parse(body);
    const user = c.get("user") as UserWithRelations;
    if (!user) {
      return c.json({ message: "not authenticated" }, 401);
    }

    const gameName = `${data.gameId}RTG`;
    // Use the new SessionManager to start the game session
    const gameSession = await SessionManager.startGameSession(c, gameName);
    const newGameSessionId = gameSession.id;

    const settings = await createRedtigerSettings(user, gameName, newGameSessionId, c, data);
    return c.json(settings);
  },
  spin: async (c: Context) => {
    const body = await c.req.json();
    const data = rtgSpinRequestDtoSchema.parse(body);
    const user = c.get("user") as UserWithRelations;
    if (!user) {
      return c.json({ message: "not authenticated" }, 401);
    }
    if (!user.currentGameSessionDataId) {
      return c.json({ message: "no gameSession" }, 404);
    }
    // Use the new SessionManager to get the game session
    const gameSession = await SessionManager.getGameSession(user.currentGameSessionDataId);
    if (!gameSession) {
      return c.json({ message: "no gameSession" }, 404);
    }

    const gameName = `${data.gameId}RTG`;
    if (!gameName) {
      return c.json({ message: "no gameName" }, 404);
    }

    const spin = await createRedtigerSpin(c, data);
    return c.json(spin);
  },
};
