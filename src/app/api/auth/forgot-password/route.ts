import { NextResponse, type NextRequest } from "next/server";
import { db } from "~/server/db";
import { passwordResetTokens, users } from "~/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import {
  sendPasswordResetEmail,
  generatePasswordResetToken,
  getPasswordResetTokenExpiry,
} from "~/lib/email";
import { eq, and, lt, isNull, gt } from "drizzle-orm";

type User = InferSelectModel<typeof users>;
type PasswordResetToken = InferSelectModel<typeof passwordResetTokens>;

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "البريد الإلكتروني مطلوب" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = (await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    })) as User | undefined;

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        },
        { status: 200 },
      );
    }

    const now = new Date();

    await db
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, existingUser.id),
          lt(passwordResetTokens.createdAt, now),
        ),
      );

    const existingToken = (await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.userId, existingUser.id),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    })) as PasswordResetToken | undefined;

    let token = existingToken?.token;
    if (!token) {
      token = generatePasswordResetToken();
      await db.insert(passwordResetTokens).values({
        userId: existingUser.id,
        token,
        expiresAt: getPasswordResetTokenExpiry(),
      });
    }

    const result = await sendPasswordResetEmail({
      email: existingUser.email,
      token,
      userName: existingUser.name,
    });

    if (!result.success) {
      console.error("Failed to send password reset email:", result.error);
      return NextResponse.json(
        { error: "فشل في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "حدث خطأ. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}
