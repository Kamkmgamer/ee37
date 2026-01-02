"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { users, emailVerificationCodes } from "~/server/db/schema";
import { eq, or } from "drizzle-orm";
import { comparePassword } from "~/server/auth";
import { createSession, deleteSession } from "~/lib/session";
import { redirect } from "next/navigation";
import {
  sendVerificationEmail,
  generateVerificationCode,
  getVerificationCodeExpiry,
} from "~/lib/email";

const signupSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  collegeId: z
    .string()
    .length(12, "الرقم الجامعي يجب أن يكون 12 رقماً")
    .regex(
      /^(2018|2019|2020)/,
      "الرقم الجامعي يجب أن يبدأ بـ 2018، 2019، أو 2020",
    ),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

const loginSchema = z.object({
  identifier: z.string().min(1, "البريد الإلكتروني أو الرقم الجامعي مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type AuthState = {
  error?: {
    name?: string[];
    collegeId?: string[];
    email?: string[];
    password?: string[];
    identifier?: string[];
    form?: string;
  };
  success?: boolean;
  redirectUrl?: string;
};

export async function signup(
  prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const data = Object.fromEntries(formData.entries());
  const validation = signupSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors as AuthState["error"],
    };
  }

  const { name, collegeId, email, password } = validation.data;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await db.query.users.findFirst({
    where: or(eq(users.email, normalizedEmail), eq(users.collegeId, collegeId)),
  });

  if (existingUser) {
    return {
      error: {
        form: "مستخدم بهذا البريد الإلكتروني أو الرقم الجامعي موجود بالفعل",
      },
    };
  }

  const existingCode = await db.query.emailVerificationCodes.findFirst({
    where: eq(emailVerificationCodes.email, normalizedEmail),
  });

  if (existingCode) {
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
    return {
      error: {
        form: "فشل إرسال بريد التحقق. يرجى المحاولة مرة أخرى.",
      },
    };
  }

  return {
    success: true,
    redirectUrl: `/verification?email=${encodeURIComponent(normalizedEmail)}&name=${encodeURIComponent(name)}`,
  };
}

export async function login(
  prevState: AuthState | null,
  formData: FormData,
): Promise<AuthState> {
  const data = Object.fromEntries(formData.entries());
  const validation = loginSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors as AuthState["error"],
    };
  }

  const { identifier, password } = validation.data;
  const normalizedIdentifier = identifier.toLowerCase();

  const user = await db.query.users.findFirst({
    where: or(
      eq(users.email, normalizedIdentifier),
      eq(users.collegeId, identifier),
    ),
  });

  if (!user || !(await comparePassword(password, user.password))) {
    return {
      error: {
        form: "بيانات الدخول غير صحيحة",
      },
    };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return { success: true };
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
