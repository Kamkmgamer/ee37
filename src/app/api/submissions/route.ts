import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { submissions } from "~/server/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allSubmissions = await db
      .select()
      .from(submissions)
      .orderBy(desc(submissions.createdAt));

    return NextResponse.json(allSubmissions);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
