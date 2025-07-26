import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import {
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
  console.log(`🌱 Seeding ${count} random users, each with a wallet and VIP info...`);

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
      // 1. Create User
      const [newUser] = await tx
        .insert(schema.User)
        .values({
          username,
          passwordHash: hashedPassword,
          totalXpGained: 0,
          createdAt,
          avatar: playerAvatar,
        })
        .returning();

      // 2. Create Wallet
      const initialBalance = randNumber({ min: 1000, max: 20000 });
      const [newWallet] = await tx.insert(schema.Wallet).values({
        userId: newUser.id,
        balance: initialBalance,
        operatorId,
        isDefault: true,
      }).returning();

      // 3. Create VipInfo
      const [newVipInfo] = await tx.insert(schema.VipInfo).values({
        userId: newUser.id,
        level: 1,
        xp: 0,
        totalXp: 0,
      }).returning();

      // 4. Update User with activeWalletId and vipInfoId
      await tx.update(schema.User).set({
        activeWalletId: newWallet.id,
        vipInfoId: newVipInfo.id,
      }).where(eq(schema.User.id, newUser.id));

      // 5. Create AuthSession
      await tx.insert(schema.AuthSession).values({
        userId: newUser.id,
        status: "ACTIVE",
      });

      console.log(
        `👤 Created user '${username}' (Password: ${password}) with wallet, VIP info, and auth session.`,
      );
    });
  }
}

export async function seedHardcodedUser(
  db: NodePgDatabase<typeof schema>,
  operatorId: string,
) {
  console.log("🔒 Seeding hardcoded user 'asdf' with a wallet and VIP info...");
  const username = "asdf";
  const password = "asdfasdf";

  const existingUser = await db.query.User.findFirst({
    where: eq(schema.User.username, username),
  });

  if (existingUser) {
    console.log("✅ Hardcoded user 'asdf' already exists.");
    return;
  }

  const hashedPassword = await Bun.password.hash(password);
  await db.transaction(async (tx) => {
    // 1. Create User
    const [newUser] = await tx
      .insert(schema.User)
      .values({
        username,
        avatar: "avatar-01.webp",
        totalXpGained: 0,
        passwordHash: hashedPassword,
      })
      .returning();

    // 2. Create Wallet
    const [newWallet] = await tx.insert(schema.Wallet).values({
      userId: newUser.id,
      operatorId,
      balance: 50000,
      isDefault: true,
    }).returning();

    // 3. Create VipInfo
    const [newVipInfo] = await tx.insert(schema.VipInfo).values({
      userId: newUser.id,
      level: 1,
      xp: 0,
      totalXp: 0,
    }).returning();

    // 4. Update User with activeWalletId and vipInfoId
    await tx.update(schema.User).set({
      activeWalletId: newWallet.id,
      vipInfoId: newVipInfo.id,
    }).where(eq(schema.User.id, newUser.id));

    // 5. Create AuthSession
    await tx.insert(schema.AuthSession).values({
      userId: newUser.id,
      status: "ACTIVE",
    });
  });

  console.log(`✅ Hardcoded user 'asdf' created. Password is '${password}'`);
}