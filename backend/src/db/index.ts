import { SQL } from 'bun'
import { drizzle } from 'drizzle-orm/bun-sql'

import env from '../env'

import * as enums from './schema/enums'
import * as relations from './schema/relations'
import * as schema from './schema/schema'

const combinedSchema = { ...schema, ...relations, ...enums }
const client = new SQL(env.DATABASE_URL!)
const db = drizzle(client, { schema: combinedSchema, logger: false })
export default db

export * from './schema'
