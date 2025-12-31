import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { submissions, users } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allSubmissions = await db
      .select({
        id: submissions.id,
        name: submissions.name,
        word: submissions.word,
        imageUrl: submissions.imageUrl,
        createdAt: submissions.createdAt,
        isAnonymous: submissions.isAnonymous,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          collegeId: users.collegeId,
        },
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.userId, users.id))
      .orderBy(desc(submissions.createdAt));

    return NextResponse.json(allSubmissions);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json(
      { error: "فشل في جلب المشاركات" },
      { status: 500 },
    );
  }
}
