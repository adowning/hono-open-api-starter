import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../../src/db/schema'
import productsData from './json/products.json'

export async function seedProducts(
  db: NodePgDatabase<typeof schema>,
  operatorId: string
) {
  console.log('🛍️ Seeding products...')

  if (!operatorId) {
    throw new Error('An Operator ID is required to seed products.')
  }

  const productsToInsert = productsData.map((product) => ({
    ...product,
    id: `prod_${crypto.randomUUID()}`, // Ensure a unique ID for each product
    operatorId: operatorId, // Link each product to the default operator
    bonusTotalInCents: 0,
    bestValue: 0,
    discountInCents: 0,
    description: undefined,
    url: undefined,
  }))

  await db
    .insert(schema.Product)
    .values(productsToInsert)
    .onConflictDoNothing()

  console.log(`✅ ${productsData.length} products seeded.`)
}
