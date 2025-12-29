import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { submissions } from "~/server/db/schema";

import { verifySession } from "~/lib/session";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    const userId = session?.userId ?? null;

    const body = await request.json() as {
      name: string;
      word: string;
      imageUrl?: string;
    };
    
    const { name, word, imageUrl } = body;

    if (!name || !word) {
      return NextResponse.json(
        { error: "الاسم والكلمة مطلوبان" },
        { status: 400 }
      );
    }

    // Save to database
    const [submission] = await db
      .insert(submissions)
      .values({
        name,
        word,
        imageUrl: imageUrl ?? null,
        imageName: imageUrl ? imageUrl.split("/").pop() ?? null : null,
        userId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "فشل في معالجة المشاركة" },
      { status: 500 }
    );
  }
}
