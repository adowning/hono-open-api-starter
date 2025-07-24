import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { User } from "#/db";
import { createRouter } from "#/lib/create-app";
import { authMiddleware } from "#/middlewares/auth.middleware";
import { sessionMiddleware } from "#/middlewares/session.middleware";

import * as controller from "./auth.controller";

const tags = ["Auth"];

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
        user: User,
      }),
      "The login token",
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
        user: z.any(),

      }),
      "The signup token",
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

      z.object(),
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
      z.object({
        message: z.string(),
      }),
      "Logout successful",
    ),
  },
});

// Public routes
const router = createRouter()
  .openapi(loginRoute, controller.login as any)
  .openapi(signupRoute, controller.signup as any)
  .openapi(logoutRoute, controller.logout)
  // .use(authMiddleware, sessionMiddleware)
  .openapi(sessionRoute, controller.session as any);

// Protected routes (require authentication)
// const protectedRouter = createRouter()
//   .use("*", (c, next) => {
//     // Skip auth for OPTIONS requests
//     if (c.req.method === "OPTIONS")
//       return next();
//     return authMiddleware(c, next);
//   })
//   .openapi(sessionRoute, controller.session);

// Combine routers
// const router = createRouter()
//   .route("/", publicRouter)
//   .route("/", protectedRouter);

export default router;
