import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas"; // Import the helper

import { selectAuthSessionSchema, selectGameSession, selectOperatorSchema, selectVipInfoSchema, selectWalletSchema, UserResponseSchema } from "#/db/schema";
import { createRouter } from "#/lib/create-app";
import { authMiddleware } from "#/middlewares/auth.middleware";
import { sessionMiddleware } from "#/middlewares/session.middleware";

import * as controller from "./auth.controller";

const tags = ["Auth"];

// Use the Drizzle-Zod schema for the user object, but omit sensitive data for the response documentation

const loginRoute = createRoute({
  path: "/login",
  method: "post",
  request: {
    body: jsonContentRequired(
      z.object({
        username: z.string(),
        password: z.string(),
        uid: z.string().optional(),
      }),
      "The user to login",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        user: UserResponseSchema,
      }),
      "The login token and user object",
    ),
  },
});

const signupRoute = createRoute({
  path: "/signup",
  method: "post",
  request: {
    body: jsonContentRequired(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
      "The user to signup",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        user: UserResponseSchema,
      }),
      "The signup token and user object",
    ),
  },
});

const sessionRoute = createRoute({
  method: "get",
  path: "/me",
  tags,
  middleware: [authMiddleware, sessionMiddleware],
  summary: "Get current user session",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        user: UserResponseSchema,
        authSession: selectAuthSessionSchema,
        gameSession: selectGameSession.optional(), // z.any().optional().openapi({ description: "The current game session, if any." }),
        wallet: selectWalletSchema,
        vipInfo: selectVipInfoSchema,
        operator: selectOperatorSchema,
      }),
      "The current user session",
    ),
  },
});

const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  tags,
  summary: "Logout current user",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("Successfully logged out"),
      "Logout successful",
    ),
  },
});

// Public routes
const router = createRouter()
  .openapi(loginRoute, controller.login as any)
  .openapi(signupRoute, controller.signup as any)
  .openapi(logoutRoute, controller.logout as any)
  .openapi(sessionRoute, controller.session as any);

export default router;
