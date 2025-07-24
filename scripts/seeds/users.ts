import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import {
  rand,
  randNumber,
  randPassword,
  randPastDate,
  randUserName,
} from "@ngneat/falso";
import { eq } from "drizzle-orm";

import * as schema from "../../src/db/schema";

export async function seedUsers(
  db: NodePgDatabase<typeof schema>,
  count: number,
  operatorId: string,
) {
  console.log(`🌱 Seeding ${count} random users, each with a wallet...`);

  const allVipLevels = await db.select().from(schema.VipLevel);

  if (allVipLevels.length === 0) {
    throw new Error("VIP levels must be seeded before users.");
  }

  for (let i = 0; i < count; i++) {
    const username = randUserName();
    const password = randPassword();
    const hashedPassword = await Bun.password.hash(password);
    const createdAt = randPastDate({ years: 1 });
    const avatarN = randNumber({ min: 1, max: 9 });
    const playerAvatar = `avatar-0${avatarN}.webp`;

    await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(schema.User)
        .values({
          username,
          passwordHash: hashedPassword,
          totalXpGained: 0, // Initialize totalXpGained
          createdAt,
          avatar: playerAvatar, // vipLevel is not a direct column on User, it's part of VipInfo
        })
        .returning();
      const initialBalance = randNumber({ min: 1000, max: 20000 });

      await tx.insert(schema.Wallet).values({
        id: `wallet_${crypto.randomUUID()}`,
        userId: newUser.id,
        balance: initialBalance,
        operatorId,
        isDefault: true,
      });

      // await tx.insert(schema.balances).values({
      //   userId: newUser.id,
      //   amount: initialBalance,
      //   availableBalance: initialBalance,
      // });

      await tx.insert(schema.AuthSession).values({
        userId: newUser.id,
        status: "ACTIVE",
      });

      console.log(
        `👤 Created user '${username}' (Password: ${password}) with an associated wallet and auth session.`,
      );
    });
  }
}

export async function seedHardcodedUser(
  db: NodePgDatabase<typeof schema>,
  operatorId: string,
) {
  console.log("🔒 Seeding hardcoded user 'asdf' with a wallet...");
  const username = "asdf";
  const password = "asdfasdf";

  const [existingUser] = await db
    .select()
    .from(schema.User)
    .where(eq(schema.User.username, username));

  if (existingUser) {
    console.log("✅ Hardcoded user 'asdf' already exists.");
    return;
  }

  const hashedPassword = await Bun.password.hash(password);
  await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(schema.User)
      .values({
        username,
        avatar: `avatar-01.webp`,
          totalXpGained: 0, // Initialize totalXpGained
        passwordHash: hashedPassword, // vipLevel is not a direct column on User, it's part of VipInfo
      })
      .returning();

    const [newWallet] = await tx.insert(schema.Wallet).values({
      id: `wallet_${crypto.randomUUID()}`,
      userId: newUser.id,
      operatorId,
      balance: 50000,
      isDefault: true,
    }).returning();

    await tx.update(schema.User).set({ activeWalletId: newWallet.id }).where(eq(schema.User.id, newUser.id));

    await tx.insert(schema.AuthSession).values({
      userId: newUser.id,
      status: "ACTIVE",
    });
  });

  console.log(`✅ Hardcoded user 'asdf' created. Password is '${password}'`);
}
