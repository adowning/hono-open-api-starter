import type { Context, Next } from "hono";

import { and, eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import * as jose from "jose";

import db, { AuthSession, User } from "#/db";
import env from "#/env";

export async function authMiddleware(c: Context, next: Next) {
  let token: string | undefined;

  // 1. Check for Bearer token in the Authorization header
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Fallback to checking for the cookie
  if (!token) {
    token = getCookie(c, "access_token");
  }

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (!payload || !payload.userId || !payload.sessionId) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const authSession = await db.query.AuthSession.findFirst({
      where: and(eq(AuthSession.id, payload.sessionId as string), eq(AuthSession.status, "ACTIVE")),
    });

    if (!authSession) {
      return c.json({ error: "Session not found or has expired" }, 401);
    }

    const user = await db.query.User.findFirst({
      where: eq(User.id, payload.userId as string),
      with: {
        activeWallet: {
          with: { operator: true },
        },
        vipInfo: true,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    const activeWallet = user.activeWallet;
    if (!activeWallet) {
      return c.json({ error: "activeWallet not found or has expired" }, 401);
    }
    c.set("vipInfo", user.vipInfo);
    c.set("operator", activeWallet.operator);
    c.set("wallet", activeWallet);
    c.set("token", token);
    c.set("authSession", authSession);
    c.set("user", user);
    await next();
  }
  catch (e) {
    console.log(e);
    return c.json({ error: "Invalid token" }, 401);
  }
}
