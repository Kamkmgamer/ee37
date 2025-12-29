// Seed AI User - Run with: npx tsx --env-file=.env scripts/seed-ai-user.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { users, userProfiles } from "../src/server/db/schema";

const AI_USER_ID = "00000000-0000-0000-0000-000000000001";

async function seedAIUser() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found. Run with: npx tsx --env-file=.env scripts/seed-ai-user.ts");
    process.exit(1);
  }

  const conn = postgres(databaseUrl);
  const db = drizzle(conn);

  console.log("Seeding AI User...");

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, AI_USER_ID))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("✅ AI User already exists, skipping...");
      await conn.end();
      process.exit(0);
    }

    await db.insert(users).values({
      id: AI_USER_ID,
      name: "مساعد الدفعة",
      collegeId: "000000000000",
      email: "ai-assistant@ee37.local",
      password: "AI_USER_NO_LOGIN",
    });

    await db.insert(userProfiles).values({
      userId: AI_USER_ID,
      bio: "أنا مساعد الدفعة الذكي، هنا لمساعدتك في أي سؤال عن الدفعة أو المواد الدراسية.",
      avatarUrl: null,
    });

    console.log("✅ AI User seeded successfully!");
    await conn.end();
  } catch (error) {
    console.error("❌ Failed to seed AI user:", error);
    await conn.end();
    process.exit(1);
  }

  process.exit(0);
}

seedAIUser();
