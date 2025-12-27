import { db } from "./src/server/db/index.js";
import { sql } from "drizzle-orm";

async function resetDatabase() {
  console.log("Dropping existing tables...");
  
  await db.execute(sql`DROP TABLE IF EXISTS ee37_submission CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS ee37_post CASCADE`);
  await db.execute(sql`DROP SEQUENCE IF EXISTS ee37_post_id_seq CASCADE`);
  await db.execute(sql`DROP SEQUENCE IF EXISTS ee37_submission_id_seq CASCADE`);
  
  console.log("Tables dropped successfully!");
  console.log("Now run: pnpm db:push");
  
  process.exit(0);
}

resetDatabase().catch(console.error);
