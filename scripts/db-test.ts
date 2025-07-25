import db from "../src/db";
import { User } from "../src/db/slim.schema";
import { eq } from "drizzle-orm";

async function testDbConnection() {
  try {
    console.log("Querying user 'asdf' directly from the database...");
    const result = await db
      .select()
      .from(User)
      .where(eq(User.username, "asdf"))
      .limit(1);
    const userRecord = result[0];
    console.log("Query result:", userRecord);
  } catch (error) {
    console.error("Error querying user:", error);
  }
}

testDbConnection();