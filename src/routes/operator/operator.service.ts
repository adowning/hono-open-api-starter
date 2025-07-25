import { eq } from "drizzle-orm";

import db, { Product } from "#/db";

export async function getOperators() {
  return db.query.Operator.findMany();
}

export async function getProductsByOperatorId(operatorId: string) {
  return db.query.Product.findMany({
    where: eq(Product.operatorId, operatorId),
  });
}