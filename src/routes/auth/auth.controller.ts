import type { Context } from "hono";

import { setCookie } from "hono/cookie";

import env from "#/env";

import * as service from "./auth.service";

export async function login(c: Context) {
  const { username, password, uid } = await c.req.json();
  const {
    accessToken,
    refreshToken,
    user,
  } = await service.login(username, password, uid);
  setCookie(c, "access_token", accessToken, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 60 * 15, // 15 minutes
  });
  console.log(accessToken);
  return c.json({ accessToken, refreshToken, user });
}

export async function signup(c: Context) {
  const { username, password } = await c.req.json();
  const { accessToken, refreshToken, user } = await service.signup(c, username, password);
  return c.json({ accessToken, refreshToken, user });
}

export async function session(c: Context) {
  const user = c.get("user");
  const authSession = c.get("authSession");
  const gameSession = c.get("gameSession");
  const wallet = c.get("wallet");
  const vipInfo = c.get("vipInfo");
  const operator = c.get("operator");

  return c.json({
    user: {
      ...user,
      passwordHash: undefined,
    },
    authSession,
    gameSession,
    wallet,
    vipInfo,
    operator,
  },
  );
}

export async function logout(c: Context) {
  const authSession = c.get("authSession");
  if (authSession) {
    await service.logout(authSession.id);
  }

  setCookie(c, "access_token", "", {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    expires: new Date(0),
  });

  return c.json({ message: "Successfully logged out" }, 200);
}
