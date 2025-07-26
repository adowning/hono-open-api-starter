import { defineConfig } from 'drizzle-kit'

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
    schema: './src/db/slim.schema.ts',
    out: './src/db/migrations',
    dialect: 'postgresql',
    casing: 'camelCase',
    dbCredentials: {
        url: 'postgres://user:password@localhost:5439/cleaner',
    },
})
