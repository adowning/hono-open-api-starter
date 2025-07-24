import type { Context } from "hono";

import type { UserWithRelations } from "#/db";

import {
  createRedtigerSettings,
  createRedtigerSpin,
} from "./redtiger.service";
import {
  rtgSettingsRequestDtoSchema,
  rtgSpinRequestDtoSchema,
} from "./redtiger.types";

export const redtigerController = {
  settings: async (c: Context) => {
    const body = await c.req.json();
    const data = rtgSettingsRequestDtoSchema.parse(body);
    const user = c.get("user") as UserWithRelations;
    const gameSessionId = c.get("gameSessionId");
    const gameName = c.get("gameName");
    const settings = await createRedtigerSettings(user, gameName, gameSessionId, c, data);
    return c.json(settings);
  },
  spin: async (c: Context) => {
    const body = await c.req.json();
    const data = rtgSpinRequestDtoSchema.parse(body);
    const spin = await createRedtigerSpin(c, data);
    return c.json(spin);
  },
};
