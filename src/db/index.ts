import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

import env from "#/env";

import * as enums from "./enums.schema";
import * as relations from "./relations.schema";
import * as schema from "./slim.schema";

const combinedSchema = { ...schema, ...relations, ...enums };

const client = new SQL(env.DATABASE_URL!);
const db = drizzle(client, { schema: combinedSchema });
export default db;

export * from "./rtg.schema";
export * from "./slim.schema";
export * from "./types";
export { combinedSchema };
