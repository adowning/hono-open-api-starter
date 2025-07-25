import { createRoute, z } from "@hono/zod-openapi";

import { VipInfoResponseSchema, selectVipLevelSchema, selectVipRankSchema } from "#/db";
import { createRouter } from "#/lib/create-app";
import { authMiddleware } from "#/middlewares/auth.middleware";

import * as controller from "./vip.controller";

const tags = ["VIP"];

// --- Route Definitions ---
const getMyVipDetailsRoute = createRoute({
  method: "get",
  path: "/vip/me",
  tags,
  summary: "Get the authenticated user's VIP details",
  responses: {
    200: {
      description: "Returns the user's VIP information, rank, and progress.",
      content: {
        "application/json": {
          schema: z.object({
            info: VipInfoResponseSchema,
            rank: selectVipRankSchema,
            xpForNextLevel: z.number(),
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
  path: "/vip/levels",
  tags,
  summary: "Get the configuration for all VIP levels",
  responses: {
    200: {
      description: "Returns the VIP level configuration table.",
      content: {
        "application/json": {
          schema: z.array(selectVipLevelSchema),
        },
      },
    },
  },
});

const getVipRanksRoute = createRoute({
  method: "get",
  path: "/vip/ranks",
  tags,
  summary: "Get the configuration for all VIP ranks",
  responses: {
    200: {
      description: "Returns the VIP rank configuration table.",
      content: {
        "application/json": {
          schema: z.array(selectVipRankSchema),
        },
      },
    },
  },
});

const router = createRouter();

// All VIP routes require authentication
router.use("*", authMiddleware);

router.openapi(getMyVipDetailsRoute, controller.getMyVipDetails as any);
router.openapi(getVipLevelsRoute, controller.getVipLevels as any);
router.openapi(getVipRanksRoute, controller.getVipRanks as any);

export default router;