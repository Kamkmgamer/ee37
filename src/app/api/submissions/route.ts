import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { submissions } from "~/server/db/schema";
import { desc, and, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semesterParam = searchParams.get("semester");
    const yearParam = searchParams.get("year");

    let query = db
      .select({
        id: submissions.id,
        name: submissions.name,
        word: submissions.word,
        imageUrl: submissions.imageUrl,
        createdAt: submissions.createdAt,
        userId: submissions.userId,
        isAnonymous: submissions.isAnonymous,
        semester: submissions.semester,
        batchId: submissions.batchId,
      })
      .from(submissions);

    const conditions = [];
    let filterDescription = "";

    if (semesterParam) {
      const semester = parseInt(semesterParam);
      if (!isNaN(semester) && semester >= 1 && semester <= 5) {
        conditions.push(eq(submissions.semester, semester));
        filterDescription = `Semester ${semester}`;
      }
    }

    if (yearParam) {
      const year = parseInt(yearParam);
      if (!isNaN(year) && year >= 1 && year <= 3) {
        let semestersInYear: number[] = [];
        if (year === 1) semestersInYear = [1, 2];
        else if (year === 2) semestersInYear = [3, 4];
        else if (year === 3) semestersInYear = [5];

        conditions.push(inArray(submissions.semester, semestersInYear));
        filterDescription = `Year ${year}`;
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const allSubmissions = await query.orderBy(desc(submissions.createdAt));

    return NextResponse.json({
      submissions: allSubmissions,
      filter: filterDescription || null,
    });
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json(
      { error: "فشل في جلب المشاركات" },
      { status: 500 },
    );
  }
}
