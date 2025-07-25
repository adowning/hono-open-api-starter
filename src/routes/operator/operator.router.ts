import { createRoute, z } from "@hono/zod-openapi";

import { OperatorResponseSchema, ProductResponseSchema } from "#/db";
import { createRouter } from "#/lib/create-app";
import { authMiddleware } from "#/middlewares/auth.middleware";

import * as controller from "./operator.controller";

const tags = ["Operator"];

const getOperatorsRoute = createRoute({
  method: "get",
  path: "/operators",
  tags,
  summary: "Get all operators",
  responses: {
    200: {
      description: "Returns a list of operators.",
      content: {
        "application/json": {
          schema: z.array(OperatorResponseSchema),
        },
      },
    },
    401: { description: "Unauthorized" },
  },
});

const getOperatorProductsRoute = createRoute({
  method: "get",
  path: "/operator/products",
  tags,
  summary: "Get all products for the current user's operator",
  responses: {
    200: {
      description: "Returns a list of products.",
      content: {
        "application/json": {
          schema: z.array(ProductResponseSchema),
        },
      },
    },
    401: { description: "Unauthorized" },
  },
});

const router = createRouter();

router.use("*", authMiddleware);

router.openapi(getOperatorsRoute, controller.getOperators as any);
router.openapi(getOperatorProductsRoute, controller.getOperatorProducts as any);

export default router;