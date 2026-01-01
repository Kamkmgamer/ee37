import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { submissions } from "~/server/db/schema";
import { verifySession } from "~/lib/session";
import { randomUUID } from "crypto";

const SUBMISSION_DEADLINE = new Date("2025-12-31T23:59:59");

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    const userId = session?.userId ?? null;

    const body = (await request.json()) as {
      name: string;
      images: Array<{
        imageUrl: string;
        imageName: string;
        word?: string;
      }>;
      semester?: number;
      isAnonymous?: boolean;
    };

    const { name, images, semester, isAnonymous = false } = body;

    if (!name || !images || images.length === 0) {
      return NextResponse.json(
        { error: "الاسم وصور واحدة على الأقل مطلوبان" },
        { status: 400 },
      );
    }

    const isLateSubmission = new Date() > SUBMISSION_DEADLINE;
    const batchId = randomUUID();

    const submissionData = images.map((img) => ({
      name,
      word: img.word ?? null,
      imageUrl: img.imageUrl,
      imageName: img.imageName,
      semester: semester ?? null,
      batchId,
      userId,
      isAnonymous,
    }));

    const newSubmissions = await db
      .insert(submissions)
      .values(submissionData)
      .returning();

    return NextResponse.json({
      success: true,
      submissions: newSubmissions.map((s) => ({
        id: s.id,
        imageUrl: s.imageUrl,
        word: s.word,
        semester: s.semester,
        batchId: s.batchId,
      })),
      isLate: isLateSubmission,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "فشل في معالجة المشاركة" },
      { status: 500 },
    );
  }
}
