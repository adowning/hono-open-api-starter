import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas"; // Import the helper

import { selectAuthSessionSchema, UserResponseSchema } from "#/db";
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
  tags: ["Auth"],
  middleware: [authMiddleware, sessionMiddleware],
  summary: "Get current user session",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        user: UserResponseSchema,
        authSession: selectAuthSessionSchema,
        // You can add more detailed schemas for the other session properties here if needed
        gameSession: z.any().optional(),
        wallet: z.any().optional(),
        vipInfo: z.any().optional(),
        operator: z.any().optional(),
      }),
      "The current user session",
    ),
  },
});

const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  tags: ["Auth"],
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
