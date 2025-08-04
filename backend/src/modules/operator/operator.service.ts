import { eq } from 'drizzle-orm'

import db from '#/db'
import { products } from '#/db/schema'

export async function getOperators() {
    return db.query.operators.findMany()
}

export async function getProductsByOperatorId(operatorId: string) {
    return db.query.products.findMany({
        where: eq(products.operatorId, operatorId),
    })
}
