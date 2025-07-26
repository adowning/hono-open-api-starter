import type { Context } from "hono";

import type { OperatorType } from "#/db";

import * as service from "./operator.service";

export async function getOperators(c: Context) {
  const operators = await service.getOperators();
  return c.json(operators);
}

export async function getOperatorProducts(c: Context) {
  const operator = c.get("operator") as OperatorType;
  if (!operator) {
    return c.json({ error: "Operator not found in context" }, 401);
  }
  const products = await service.getProductsByOperatorId(operator.id);
  return c.json(products);
}
