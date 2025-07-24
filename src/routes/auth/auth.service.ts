/* eslint-disable ts/ban-ts-comment */
import type { Context } from "hono";

import { eq } from "drizzle-orm";
import * as jose from "jose";

import db, {
  AuthSession,
  insertUserSchema,
  User,

} from "#/db";
import env, { } from "#/env";
import { getGameSessionFromCache } from "#/lib/cache";
import { endAndPersistGameSession } from "#/lib/sessions";

const ACCESS_TOKEN_EXPIRES_IN = "7 days";
const REFRESH_TOKEN_EXPIRES_IN = "7 days";

export async function login(username: string, password: string, uid?: string) {
  if (!username && !uid) {
    throw new Error("Username or UID is required");
  }

  let userRecord;
  try {
    if (username) {
      const result = await db
        .select()
        .from(User)
        .where(eq(User.username, username))
        .limit(1);
      userRecord = result[0];
    }
    else if (uid) {
      const result = await db
        .select()
        .from(User)
        .where(eq(User.id, uid))
        .limit(1);
      userRecord = result[0];
    }
  }
  catch (error) {
    console.error("Error querying user:", error);
    throw new Error("Failed to query user");
  }
  if (!userRecord || !userRecord.passwordHash) {
    throw new Error("Invalid credentials - user does not exist");
  }
  const isPasswordValid = await Bun.password.verify(
    password,
    userRecord.passwordHash,
  );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials - password");
  }

  const [authSession] = await db.insert(AuthSession).values({
    userId: userRecord.id,
    status: "ACTIVE",
  }).returning();

  const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
  const accessToken = await new jose.SignJWT({ userId: userRecord.id, sessionId: authSession.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(secret);

  const refreshToken = await new jose.SignJWT({ userId: userRecord.id, sessionId: authSession.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .sign(secret);

  userRecord.passwordHash = null;
  const user = userRecord; // z.object(selectUsersSchema).parse(userRecord)

  return { accessToken, refreshToken, user };
}

export async function logout(authSessionId: string) {
  await db.update(AuthSession).set({ status: "EXPIRED" }).where(eq(AuthSession.id, authSessionId));
  const gameSession = getGameSessionFromCache(authSessionId);
  if (gameSession) {
    await endAndPersistGameSession(gameSession.id);
  }
}

export async function signup(c: Context, username: string, password: string) {
  const passwordHash = await Bun.password.hash(password, "bcrypt");
  // const initialDepositAmount = 500; // 500 cents

  // try {
  const result = await db.transaction(async (tx) => {
    const existingUser = await tx.query.User.findFirst({
      where: eq(User.username, username),
    });

    if (existingUser) {
      tx.rollback();
      throw new Error("User with this username already exists");
    }

    const newUserValues = insertUserSchema.parse({
      username,
      passwordHash,
      inviteCode: crypto.randomUUID().slice(0, 8),
      inviteUrl: `/invite/${username}`,
      favoriteGameNames: [], // Add this line to provide a default empty array
    });

    const [newUser] = await tx
      .insert(User)
    // @ts-ignore
      .values(newUserValues)
      .returning();

    // const userId = newUser.id;

    // await tx.insert(balances).values({
    //   userId,
    //   amount: initialDepositAmount,
    //   availableBalance: initialDepositAmount,
    //   currency: "USD",
    //   real: String(initialDepositAmount),
    //   bonus: "0",
    // });

    // await tx.insert(deposits).values({
    //   userId,
    //   amount: initialDepositAmount,
    //   status: "completed",
    //   note: "Initial sign-up bonus",
    //   currency: "USD",
    // });

    // await tx.insert(transactions).values({
    //   userId,
    //   amount: initialDepositAmount,
    //   type: "deposit",
    //   status: "completed",
    //   note: "Initial sign-up bonus",
    //   balance: initialDepositAmount,
    // });

    // await tx.insert(userRewards).values({ userId });
    // await tx.insert(inviteStats).values({ userId });
    // const user = await db.query.User.findFirst({
    //   where: eq(User.id, newUser.id as string),
    //   with: {
    //     activeWallet: {
    //       with: { operator: true },
    //     },
    //     vipInfo: true,
    //   },
    // });
    return { user: newUser };
  });

  const { user } = result;

  const [authSession] = await db.insert(AuthSession).values({
    userId: user.id,
    status: "ACTIVE",
  }).returning();

  const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
  const accessToken = await new jose.SignJWT({ userId: user.id, sessionId: authSession.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(secret);

  const refreshToken = await new jose.SignJWT({ userId: user.id, sessionId: authSession.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .sign(secret);

  return { accessToken, refreshToken, user };
}
// catch (error) {
//   console.error("Signup Transaction Failed:", error);
//   // return { error: (error as Error).message };
//   return c.json(null, null, null);
//   // return c.json(
//   //   {
//   //     message: HttpStatusPhrases.PROCESSING,
//   //     error: (error as Error).message,
//   //   },
//   //   HttpStatusCodes.NOT_FOUND,
//   // );
// }
// }
