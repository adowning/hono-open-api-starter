import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

import env from "#/env";

import * as schema from "./schema";
// const client = createClient({
//   url: env.DATABASE_URL,
//   authToken: env.DATABASE_AUTH_TOKEN,
// });

// const db = drizzle(client, {
//   schema,
// });
const client = new SQL(env.DATABASE_URL!);
const db = drizzle(client, { schema });
export default db;

export * from "./relations.schema";
export * from "./rtg.schema";
export * from "./slim.schema";
export * from "./types";
// import { createClient } from "@libsql/client";
// import { drizzle } from "drizzle-orm/libsql";

// import env from "@/env";

// import * as schema from "./schema";

// const client = createClient({
//   url: env.DATABASE_URL,
//   authToken: env.DATABASE_AUTH_TOKEN,
// });

// const db = drizzle(client, {
//   schema,
// });

// export default db;
