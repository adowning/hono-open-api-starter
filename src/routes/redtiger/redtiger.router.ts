import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { authMiddleware } from "#/middlewares/auth.middleware";

// import { RTGSettingsResponseDtoSchema, RTGSpinResponseDtoSchema } from "../gameplay.schema";
import { redtigerController } from "./redtiger.controller";
import { rtgSettingsRequestDtoSchema, rtgSettingsResponseDtoSchema, rtgSpinRequestDtoSchema, rtgSpinResultSchema } from "./redtiger.types";

const tags = ["RedTiger"];

const ErrorSchema = z.object({
  success: z.boolean(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const settingsRoute = createRoute({
  method: "post",
  path: "/{gameSessionId}/{gameName}/game/settings",
  tags,
  summary: "Get redtiger settings for a game",
  request: {
    params: z.object({
      gameSessionId: z.string(),
      gameName: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: rtgSettingsRequestDtoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Redtiger game settings",
      content: {
        "application/json": {
          schema: rtgSettingsResponseDtoSchema,
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

const spinRoute = createRoute({
  method: "post",
  path: "/{gameSessionId}/{gameName}/game/spin",
  tags,
  summary: "Perform a spin in a redtiger game",
  request: {
    params: rtgSpinRequestDtoSchema,
    body: {
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Redtiger spin result",
      content: {
        "application/json": {
          schema: rtgSpinResultSchema,
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

const app = new OpenAPIHono();

app.use("*", authMiddleware);

app.openapi(settingsRoute, redtigerController.settings as any);
app.openapi(spinRoute, redtigerController.spin as any);

export default app;
