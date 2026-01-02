import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { emailVerificationCodes } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import {
  sendVerificationEmail,
  generateVerificationCode,
  getVerificationCodeExpiry,
} from "~/lib/email";
import { z } from "zod";

const sendCodeSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
  name: z.string().min(2, "الاسم يجب أن يكون حقلين على الأقل"),
  collegeId: z.string().length(12, "الرقم الجامعي يجب أن يكون 12 رقماً"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const bodyRaw = await request.json();
    const body = bodyRaw as {
      email: string;
      name: string;
      collegeId: string;
      password: string;
    };
    const validation = sendCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, name, collegeId, password } = validation.data;
    const normalizedEmail = email.toLowerCase();

    const existingCode = await db.query.emailVerificationCodes.findFirst({
      where: eq(emailVerificationCodes.email, normalizedEmail),
    });

    if (existingCode) {
      const expiresAt = new Date(existingCode.expiresAt);
      const now = new Date();
      const timeRemaining = Math.floor(
        (expiresAt.getTime() - now.getTime()) / 1000 / 60,
      );

      if (timeRemaining > 1) {
        return NextResponse.json(
          { error: `يرجى الانتظار ${timeRemaining} دقيقة قبل طلب كود جديد` },
          { status: 429 },
        );
      }

      await db
        .delete(emailVerificationCodes)
        .where(eq(emailVerificationCodes.email, normalizedEmail));
    }

    const code = generateVerificationCode();
    const expiresAt = getVerificationCodeExpiry();

    const { hashPassword } = await import("~/server/auth");
    const hashedPassword = await hashPassword(password);

    await db.insert(emailVerificationCodes).values({
      email: normalizedEmail,
      code,
      name,
      collegeId,
      hashedPassword,
      expiresAt,
    });

    const result = await sendVerificationEmail({
      email: normalizedEmail,
      code,
      userName: name,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "فشل إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "تم إرسال كود التحقق بنجاح",
      expiresIn: 30,
    });
  } catch (error) {
    console.error("Send verification code error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}
