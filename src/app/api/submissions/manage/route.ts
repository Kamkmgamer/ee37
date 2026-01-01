import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { submissions } from "~/server/db/schema";
import { verifySession } from "~/lib/session";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "معرف المستخدم مطلوب" },
        { status: 400 },
      );
    }

    const userSubmissions = await db
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
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(submissions.createdAt);

    return NextResponse.json(userSubmissions);
  } catch (error) {
    console.error("Failed to fetch user submissions:", error);
    return NextResponse.json(
      { error: "فشل في جلب المشاركات" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("id");

    if (!submissionId) {
      return NextResponse.json(
        { error: "معرف المشاركة مطلوب" },
        { status: 400 },
      );
    }

    const submission = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json(
        { error: "المشاركة غير موجودة" },
        { status: 404 },
      );
    }

    const submissionData = submission[0];
    if (!submissionData) {
      return NextResponse.json(
        { error: "المشاركة غير موجودة" },
        { status: 404 },
      );
    }

    if (submissionData.userId !== session.userId) {
      return NextResponse.json(
        { error: "غير مصرح لك بحذف هذه المشاركة" },
        { status: 403 },
      );
    }

    await db.delete(submissions).where(eq(submissions.id, submissionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete submission:", error);
    return NextResponse.json({ error: "فشل في حذف المشاركة" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { id?: string; word?: string };
    const { id, word } = body;

    if (!id) {
      return NextResponse.json(
        { error: "معرف المشاركة مطلوب" },
        { status: 400 },
      );
    }

    const submission = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id))
      .limit(1);

    if (submission.length === 0) {
      return NextResponse.json(
        { error: "المشاركة غير موجودة" },
        { status: 404 },
      );
    }

    const submissionData = submission[0];
    if (!submissionData) {
      return NextResponse.json(
        { error: "المشاركة غير موجودة" },
        { status: 404 },
      );
    }

    if (submissionData.userId !== session.userId) {
      return NextResponse.json(
        { error: "غير مصرح لك بتعديل هذه المشاركة" },
        { status: 403 },
      );
    }

    await db
      .update(submissions)
      .set({ word: word ?? null })
      .where(eq(submissions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update submission:", error);
    return NextResponse.json(
      { error: "فشل في تعديل المشاركة" },
      { status: 500 },
    );
  }
}
