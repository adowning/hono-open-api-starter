import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { createRouter } from "#/lib/create-app";

import {
  insertUserSchema,
  selectUserSchema,
} from "../../db/schema";
import { notFoundSchema } from "../../lib/constants";
import * as controller from "./user.controller";

export const tags = ["User"];

export const listUser = createRoute({
  path: "/users",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectUserSchema),
      "The list of users",
    ),
  },
});

export const createUser = createRoute({
  path: "/users",
  method: "post",
  request: {
    body: jsonContentRequired(insertUserSchema, "The user to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The created user"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertUserSchema),
      "The validation error(s)",
    ),
  },
});

export const getOneUser = createRoute({
  path: "/users/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The requested user"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const updateUser = createRoute({
  path: "/users/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(selectUserSchema, "The user updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The updated user"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
    // [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
    //   createErrorSchema(User).or(createErrorSchema(IdParamsSchema)),
    //   "The validation error(s)",
    // ),
  },
});

export const removeUser = createRoute({
  path: "/users/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "User deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const checkUser = createRoute({
  method: "get",
  path: "/users/{id}/check",
  tags,
  summary: "Check if a user exists",
  request: { params: IdParamsSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ userCheck: z.boolean() }),
      "User status",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
  },
});

// export const getBalance = createRoute({
//   method: "get",
//   path: "/users/{id}/balance",
//   tags,
//   summary: "Get user's balance",
//   request: { params: IdParamsSchema },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       z.array(selectBalancesSchema),
//       "User balance",
//     ),
//   },
// });

// export const setCurrency = createRoute({
//   method: "post",
//   path: "/users/{id}/currency",
//   tags,
//   summary: "Set user's currency",
//   request: {
//     params: IdParamsSchema,
//     body: jsonContentRequired(
//       z.object({ currency: z.string() }),
//       "The currency to set",
//     ),
//   },
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(selectCurrenciesSchema, "Currency set"),
//     [HttpStatusCodes.BAD_REQUEST]: jsonContent(
//       createErrorSchema(z.object({ currency: z.string() })),
//       "Invalid currency",
//     ),
//   },
// });

export const verifyEmail = createRoute({
  method: "post",
  path: "/users/{id}/verify-email",
  tags,
  summary: "Send email verification",
  request: { params: IdParamsSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ status: z.string(), time: z.number() }),
      "Verification sent",
    ),
  },
});

export const getInfo = createRoute({
  method: "get",
  path: "/users/{id}/info",
  tags,
  summary: "Get user info",
  request: { params: IdParamsSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "User info"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
  },
});

export const getVipInfo = createRoute({
  method: "get",
  path: "/users/{id}/vipinfo",
  tags,
  summary: "Get user VIP info",
  request: { params: IdParamsSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ vipLevel: z.number().nullable() }),
      "VIP info",
    ),
  },
});

// New routes
export const getUserAmount = createRoute({
  path: "/user/amount",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        amount: z.number(),
        currency: z.object({
          fiat: z.boolean(),
          name: z.string(),
          symbol: z.string(),
          type: z.string(),
        }),
        withdraw: z.number(),
        rate: z.number(),
      }),
      "Get user amount",
    ),
  },
});

export const updateUserInfo = createRoute({
  path: "/user/change",
  method: "post",
  request: {
    body: jsonContentRequired(insertUserSchema, "The user info to update"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The updated user"),
  },
});

export const updateEmail = createRoute({
  path: "/user/email",
  method: "post",
  request: {
    body: jsonContentRequired(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      "The email to update",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The updated user"),
  },
});

export const updatePassword = createRoute({
  path: "/user/password",
  method: "post",
  request: {
    body: jsonContentRequired(
      z.object({
        now_password: z.string(),
        new_password: z.string(),
      }),
      "The password to update",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ message: z.string() }),
      "Password updated",
    ),
  },
});

export const suspendUser = createRoute({
  path: "/user/suspend",
  method: "post",
  request: {
    body: jsonContentRequired(
      z.object({
        time: z.number(),
      }),
      "The suspension time",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ message: z.string() }),
      "User suspended",
    ),
  },
});

// export const getBalanceList = createRoute({
//   path: "/user/balance/list",
//   method: "get",
//   tags,
//   responses: {
//     [HttpStatusCodes.OK]: jsonContent(
//       z.array(selectBalancesSchema),
//       "The list of balances",
//     ),
//   },
// });

export const enterGame = createRoute({
  method: "post",
  path: "/enter/game",
  tags,
  responses: { 200: { description: "Enter game" } },
});

export const userGame = createRoute({
  method: "post",
  path: "/games",
  tags,
  responses: { 200: { description: "User game" } },
});

export const favoriteGame = createRoute({
  method: "post",
  path: "/setup/game",
  tags,
  responses: { 200: { description: "Favorite game" } },
});

export const gameHistory = createRoute({
  method: "get",
  path: "/gamehistory",
  tags,
  responses: { 200: { description: "Game history" } },
});

export const spinPage = createRoute({
  method: "get",
  path: "/spinpage",
  tags,
  responses: { 200: { description: "Spin page" } },
});

export const spin = createRoute({
  method: "post",
  path: "/spin",
  tags,
  responses: { 200: { description: "Spin" } },
});

export const favoriteGameList = createRoute({
  method: "get",
  path: "/favorite/game",
  tags,
  responses: { 200: { description: "Favorite game list" } },
});

export const endGameSession = createRoute({
  method: "post",
  path: "/end-game-session",
  tags,
  summary: "End the current game session",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.boolean(), message: z.string() }),
      "Session ended response",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: { description: "Unauthorized" },
  },
});

export const router = createRouter()
  // .openapi(createUser, controller.createUser)
  .openapi(listUser, controller.listUser as any)
  .openapi(enterGame, controller.enterGame)
  .openapi(userGame, controller.userGame)
  .openapi(favoriteGame, controller.favoriteGame)
  // .openapi(gameHistory, controller.gameHistory)
  .openapi(spinPage, controller.spinPage)
  .openapi(spin, controller.spin)
  .openapi(favoriteGameList, controller.favoriteGameList)
  .openapi(endGameSession, controller.endSession as any)

  // Basic CRUD
  .openapi(getOneUser, controller.getUserById as any)
  .openapi(updateUser, controller.updateUser as any)
  .openapi(removeUser, controller.deleteUser as any)

  // From Pinia Store & HAR files
  .openapi(checkUser, controller.checkUser as any)
  // .openapi(getBalance, controller.getBalance)
  // .openapi(setCurrency, controller.setCurrency)
  .openapi(verifyEmail, controller.verifyEmail)
  .openapi(getInfo, controller.getInfo as any)
  .openapi(getVipInfo, controller.getVipInfo as any)

  // New Routes
  .openapi(getUserAmount, controller.getUserAmount)
  .openapi(updateUserInfo, controller.updateUserInfo as any)
  .openapi(updateEmail, controller.updateEmail as any)
  .openapi(updatePassword, controller.updatePassword)
  .openapi(suspendUser, controller.suspendUser);
  // .openapi(getBalanceList, controller.getBalanceList);

export default router;
