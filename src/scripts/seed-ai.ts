import { db } from "../server/db";
import { users, userProfiles } from "../server/db/schema";
import { eq } from "drizzle-orm";

const AI_USER_ID = "00000000-0000-0000-0000-000000000001";

async function main() {
  console.log("Seeding AI User...");

  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, AI_USER_ID),
  });

  if (!existingUser) {
    console.log("Creating AI User...");
    await db.insert(users).values({
      id: AI_USER_ID,
      name: "مساعد الدفعة",
      email: "ai@ee37.com",
      collegeId: "000000000000",
      password: "ai-password-placeholder",
    });

    await db.insert(userProfiles).values({
      userId: AI_USER_ID,
      bio: "أنا مساعد الدفعة الذكي. اسألني عن أي شيء!",
      location: "السيرفر",
    });

    console.log("AI User Created!");
  } else {
    console.log("AI User already exists.");
    
    // Update profile just in case
    await db.update(users).set({ 
        name: "مساعد الدفعة"
    }).where(eq(users.id, AI_USER_ID));
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
