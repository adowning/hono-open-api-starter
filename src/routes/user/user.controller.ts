import type { Context } from "hono";

import * as service from "./user.service";

// Basic CRUD
export async function listUser(c: Context) {
  const data = await service.findManyUser();
  return c.json(data, 200);
}

export async function createUser(c: Context) {
  const data = await c.req.json();
  const newUser = await service.createUser(data);
  return c.json(newUser[0], 201);
}

export async function getUserById(c: Context) {
  const id = c.req.param("id");
  const user = await service.findUserById(id);
  if (!user || user.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json(user[0], 200);
}

export async function updateUser(c: Context) {
  const id = c.req.param("id");
  const data = await c.req.json();
  const updatedUser = await service.updateUser(id, data);
  if (!updatedUser || updatedUser.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json(updatedUser[0], 200);
}

export async function deleteUser(c: Context) {
  const id = c.req.param("id");
  const deletedUser = await service.deleteUser(id);
  if (!deletedUser || deletedUser.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({ id: deletedUser[0].id }, 200);
}

// From Pinia Store & HAR files
export async function checkUser(c: Context) {
  const userId = c.req.param("id");
  const user = await service.checkUser(userId);
  if (!user || user.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({ userCheck: true }, 200);
}

// export async function getBalance(c: Context) {
//   const userId = c.req.param("id");
//   const balance = await service.getUserBalance(userId);
//   return c.json(balance, 200);
// }

// export async function setCurrency(c: Context) {
//   const userId = Number(c.req.param("id"));
//   const { currency } = await c.req.json();
//   try {
//     const result = await service.setUserCurrency(userId, currency);
//     return c.json(result, 200);
//   }
//   catch (error: unknown) {
//     if (error instanceof Error) {
//       return c.json({ error: error.message }, 400);
//     }
//     return c.json({ error: "An unknown error occurred" }, 400);
//   }
// }

export async function verifyEmail(c: Context) {
  const userId = c.req.param("id");
  const result = await service.sendEmailVerification(userId);
  return c.json(result, 200);
}

export async function getInfo(c: Context) {
  const userId = c.req.param("id");
  const info = await service.getUserInfo(userId);
  if (!info || info.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json(info[0], 200);
}

export async function getVipInfo(c: Context) {
  const userId = c.req.param("id");
  const vipInfo = await service.getVipInfo(userId);
  if (!vipInfo || vipInfo.length === 0) {
    return c.json({ vipLevel: null }, 200);
  }
  return c.json(vipInfo[0], 200);
}

// New Routes
export async function getUserAmount(c: Context) {
  const data = await service.getUserAmount();
  return c.json(data, 200);
}

export async function updateUserInfo(c: Context) {
  const data = await c.req.json();
  const updatedUser = await service.updateUserInfo(data);
  return c.json(updatedUser, 200);
}

export async function updateEmail(c: Context) {
  const data = await c.req.json();
  const updatedUser = await service.updateEmail(data);
  return c.json(updatedUser, 200);
}

export async function updatePassword(c: Context) {
  const data = await c.req.json();
  await service.updatePassword(data);
  return c.json({ message: "Password updated" }, 200);
}

export async function suspendUser(c: Context) {
  const data = await c.req.json();
  await service.suspendUser(data);
  return c.json({ message: "User suspended" }, 200);
}

// export async function getBalanceList(c: Context) {
//   const data = await service.getBalanceList();
//   return c.json(data, 200);
// }

// Game Routes
export async function enterGame(c: Context) {
  const data = await service.enterGame(); // Placeholder
  return c.json({ code: 0, data, message: "Success" });
}

export async function userGame(c: Context) {
  const data = await service.userGame(); // Placeholder
  return c.json({ code: 0, data, message: "Success" });
}

export async function favoriteGame(c: Context) {
  const data = await service.favoriteGame(); // Placeholder
  return c.json({ code: 0, data, message: "Success" });
}

// export async function gameHistory(c: Context) {
//   const userId = c.req.param("id");
//   const data = await service.getGameHistory(userId); // Placeholder
//   return c.json({ code: 0, data, message: "Success" });
// }

export async function spinPage(c: Context) {
  const data = await service.spinPage(); // Placeholder
  return c.json({ code: 0, data, message: "Success" });
}

export async function spin(c: Context) {
  const data = await service.spin(); // Placeholder
  return c.json({ code: 0, data, message: "Success" });
}

export async function favoriteGameList(c: Context) {
  const data = await service.favoriteGameList(); // Placeholder
  return c.json({ code: 0, data, message: "Success" });
}

import { startSession as startSessionFromLib } from "#/lib/sessions";

export async function startSession(c: Context) {
  const { gameId } = await c.req.json();
  const session = await startSessionFromLib(c, gameId);
  return c.json(session, 200);
}
