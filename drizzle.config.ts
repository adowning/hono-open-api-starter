import { defineConfig } from "drizzle-kit";

import env from "#/env";

// export default defineConfig({
//   schema: "./src/db/schema/index.ts",
//   out: "./src/db/migrations",
//   dialect: "sqlite",
//   driver: "turso",
//   dbCredentials: {
//     url: env.DATABASE_URL,
//     authToken: env.DATABASE_AUTH_TOKEN,
//   },
// });
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  casing: "camelCase",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
