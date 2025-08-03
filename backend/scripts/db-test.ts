import { eq } from "drizzle-orm";
import db from "../src/db";
import { users } from "../src/db/schema";

async function testDbConnection() {
  try {
    console.log("Querying user 'asdf' directly from the database...");
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, "asdf"))
      .limit(1);
    const userRecord = result[0];
    console.log("Query result:", userRecord);
  } catch (error) {
    console.error("Error querying user:", error);
  }
}

testDbConnection();