import { NextResponse, type NextRequest } from "next/server";
import { db } from "~/server/db";
import { passwordResetTokens, users } from "~/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { eq, and, gt, isNull } from "drizzle-orm";
import { hashPassword } from "~/server/auth";

type User = InferSelectModel<typeof users>;
type PasswordResetToken = InferSelectModel<typeof passwordResetTokens>;

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = (await request.json()) as {
      token: string;
      newPassword: string;
    };

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "رمز إعادة التعيين مطلوب" },
        { status: 400 },
      );
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "كلمة المرور الجديدة مطلوبة" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "يجب أن تكون كلمة المرور 8 أحرف على الأقل" },
        { status: 400 },
      );
    }

    const now = new Date();

    const resetToken = (await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    })) as PasswordResetToken | undefined;

    if (!resetToken) {
      return NextResponse.json(
        { error: "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية" },
        { status: 400 },
      );
    }

    const user = (await db.query.users.findFirst({
      where: eq(users.id, resetToken.userId),
    })) as User | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      await tx
        .update(passwordResetTokens)
        .set({
          usedAt: new Date(),
        })
        .where(eq(passwordResetTokens.id, resetToken.id));
    });

    return NextResponse.json(
      { message: "تم تغيير كلمة المرور بنجاح" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "حدث خطأ. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}
