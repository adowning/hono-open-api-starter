/* eslint-disable ts/ban-ts-comment */
import type { z } from "@hono/zod-openapi";
import type { createInsertSchema } from "drizzle-zod";

import { eq } from "drizzle-orm";

import db, { User } from "#/db";

import type {
  NewUser,
} from "../../db";

export async function findManyUser() {
  return await db.select().from(User);
}

export async function createUser(data: z.infer<ReturnType<typeof createInsertSchema>>) {
  return await db.insert(User).values(data).returning();
}

export async function findUserById(id: string) {
  return await db.select().from(User).where(eq(User.id, id));
}

export async function updateUser(id: string, data: Partial<NewUser>) {
  // @ts-ignore
  return await db.update(User).set(data).where(eq(User.id, id)).returning();
}

export async function deleteUser(id: string) {
  return await db.delete(User).where(eq(User.id, id)).returning();
}

// From Pinia Store & HAR files

export async function checkUser(userId: string) {
  // Assuming a simple check that returns the user if they exist
  return await findUserById(userId);
}

// export async function getUserBalance(userId: string) {
//   return await db.select().from(balances).where(eq(balances.userId, userId));
// }

// export async function setUserCurrency(currencyCode: string) {
//   // This is a simplified example. A real implementation would be more complex.
//   const currency = await db
//     .select()
//     .from(currencies)
//     .where(eq(currencies.code, currencyCode));
//   if (currency.length === 0) {
//     throw new Error("Invalid currency code");
//   }
//   // Logic to update user's currency preference would go here.
//   // For now, we'll just return the currency.
//   return currency[0];
// }

export async function sendEmailVerification(userId: string) {
  // Placeholder for sending a verification email
  console.log(`Sending verification email to user`, userId);
  return { status: "ok", time: Date.now() };
}

export async function getUserInfo(userId: string) {
  return await findUserById(userId);
}

export async function getVipInfo(userId: string) {
  // Assuming vip info is part of the users table for now
  return await db
    .select({ vipInfo: User.vipInfoId })
    .from(User)
    .where(eq(User.id, userId));
}

// New Routes
export async function getUserAmount() {
  // Placeholder, you will need to implement the actual logic
  return {
    amount: 1000,
    currency: { fiat: true, name: "USD", symbol: "$", type: "fiat" },
    withdraw: 500,
    rate: 1,
  };
}

export async function updateUserInfo(data: NewUser) {
  // Placeholder, you will need to implement the actual logic
  return { data };
}

export async function updateEmail(data: {
  email: string;
  password: string;
}) {
  // Placeholder, you will need to implement the actual logic
  return { ...data };
}

export async function updatePassword(data: {
  now_password: string;
  new_password: string;
}) {
  // Placeholder, you will need to implement the actual logic
  console.log(data);
}

export async function suspendUser(data: { time: number }) {
  // Placeholder, you will need to implement the actual logic
  console.log(data);
}

// export async function getBalanceList() {
//   return await db.select().from(balances);
// }

// Game Routes
export async function enterGame() {
  // Placeholder
  return {};
}

export async function userGame() {
  // Placeholder
  return [];
}

export async function favoriteGame() {
  // Placeholder
  return { success: true };
}

// export async function getGameHistory(userId: string) {
//   return await db.select().from(GameHistory).where(eq(gameHistory.userId, userId));
// }

export async function spinPage() {
  // Placeholder
  return {};
}

export async function spin() {
  // Placeholder
  return {};
}

export async function favoriteGameList() {
  // Placeholder
  return [];
}
