import { OpenAPIHono } from "@hono/zod-openapi";
import chalk from "chalk";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import { notFound, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { z } from "zod";

import { pinoLogger } from "#/middlewares/pino-logger";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();
  app
    .use(requestId())
    .use(serveEmojiFavicon("📝"))
    .use(pinoLogger());

  app.notFound(notFound);

  // Centralized Error Handler with Chalk
  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      c.var.logger.warn(chalk.yellowBright(`[HTTPException] Path: ${c.req.path}, Status: ${err.status}`));
      return err.getResponse();
    }

    if (err instanceof z.ZodError) {
      c.var.logger.info(chalk.magentaBright(`[ValidationError] Path: ${c.req.path}`));
      return c.json(
        {
          success: false,
          error: {
            message: "Validation failed",
            issues: err.flatten().fieldErrors,
          },
        },
        422,
      );
    }

    // Generic fallback for all other errors
    c.var.logger.error(chalk.redBright(`[InternalServerError] Path: ${c.req.path}`), err);
    return c.json(
      {
        success: false,
        error: {
          message: "Internal Server Error",
        },
      },
      500,
    );
  });

  return app;
}

export function createTestApp(router: AppOpenAPI) {
  return createApp().route("/", router);
}
