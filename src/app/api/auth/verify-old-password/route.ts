import { NextResponse, type NextRequest } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword } from "~/server/auth";
import { verifySession } from "~/lib/session";

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { oldPassword } = body;

    if (!oldPassword || typeof oldPassword !== "string") {
      return NextResponse.json(
        { error: "كلمة المرور القديمة مطلوبة" },
        { status: 400 },
      );
    }

    const session = await verifySession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول" },
        { status: 401 },
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 },
      );
    }

    const isValid = await comparePassword(oldPassword, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "كلمة المرور القديمة غير صحيحة" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "تم التحقق من كلمة المرور بنجاح" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify old password error:", error);
    return NextResponse.json(
      { error: "حدث خطأ. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}
