// src/middlewares/session.middleware.ts
import type { Context, Next } from "hono";

import { SessionManager } from "#/lib/session.manager";

export async function sessionMiddleware(c: Context, next: Next) {
  const authSession = c.get("authSession");

  if (!authSession) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  await SessionManager.handleIdleSession(c);

  await next();
}
