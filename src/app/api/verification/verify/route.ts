import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { emailVerificationCodes, users } from "~/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import { z } from "zod";

const verifySchema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
  code: z.string().length(6, "كود التحقق يجب أن يكون 6 أرقام"),
});

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const bodyRaw = await request.json();
    const body = bodyRaw as {
      email: string;
      code: string;
    };
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, code } = validation.data;
    const normalizedEmail = email.toLowerCase();

    const verificationRecord = await db.query.emailVerificationCodes.findFirst({
      where: and(
        eq(emailVerificationCodes.email, normalizedEmail),
        eq(emailVerificationCodes.code, code),
      ),
    });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "كود التحقق غير صحيح" },
        { status: 400 },
      );
    }

    const expiresAt = new Date(verificationRecord.expiresAt);
    const now = new Date();

    if (expiresAt < now) {
      await db
        .delete(emailVerificationCodes)
        .where(eq(emailVerificationCodes.email, normalizedEmail));

      return NextResponse.json(
        { error: "انتهت صلاحية كود التحقق. يرجى طلب كود جديد." },
        { status: 400 },
      );
    }

    const userName = String(verificationRecord.name);
    const userCollegeId = String(verificationRecord.collegeId);
    const userHashedPassword = String(verificationRecord.hashedPassword);

    const existingUser = await db.query.users.findFirst({
      where: or(
        eq(users.email, normalizedEmail),
        eq(users.collegeId, userCollegeId),
      ),
    });

    if (existingUser) {
      await db
        .delete(emailVerificationCodes)
        .where(eq(emailVerificationCodes.email, normalizedEmail));

      return NextResponse.json(
        {
          error: "مستخدم بهذا البريد الإلكتروني أو الرقم الجامعي موجود بالفعل",
        },
        { status: 400 },
      );
    }

    const result = await db
      .insert(users)
      .values({
        name: userName,
        collegeId: userCollegeId,
        email: normalizedEmail,
        password: userHashedPassword,
        emailVerified: true,
      })
      .returning();

    const newUser = result[0];
    if (!newUser) {
      return NextResponse.json(
        { error: "فشل إنشاء المستخدم" },
        { status: 500 },
      );
    }

    await db
      .delete(emailVerificationCodes)
      .where(eq(emailVerificationCodes.email, normalizedEmail));

    const { createSession } = await import("~/lib/session");

    await createSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}
