import { createRoute, z } from "@hono/zod-openapi";

import { createRouter } from "#/lib/create-app";
import { authMiddleware } from "#/middlewares/auth.middleware";

import * as controller from "./vip.controller";

const tags = ["VIP"];

// --- Route Definitions ---
const getMyVipDetailsRoute = createRoute({
  method: "get",
  path: "/me",
  tags,
  summary: "Get the authenticated user's VIP details",
  responses: {
    200: {
      description: "Returns the user's VIP information, rank, and progress.",
      content: {
        "application/json": {
          schema: z.object({
            // Define the expected shape of the response here
          }),
        },
      },
    },
    401: { description: "Unauthorized" },
    404: { description: "VIP Info not found" },
  },
});

const getVipLevelsRoute = createRoute({
  method: "get",
  path: "/levels",
  tags,
  summary: "Get the configuration for all VIP levels",
  responses: {
    200: {
      description: "Returns the VIP level configuration table.",
      content: {
        "application/json": {
          schema: z.array(z.object({
            // Define the shape of a level config object
          })),
        },
      },
    },
  },
});

const router = createRouter();

// All VIP routes require authentication
router.use("*", authMiddleware);

router.openapi(getMyVipDetailsRoute, controller.getMyVipDetails as any);
router.openapi(getVipLevelsRoute, controller.getVipLevels as any); // Cast to any to resolve type mismatch

export default router;
