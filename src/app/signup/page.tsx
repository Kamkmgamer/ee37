"use client";

import { useActionState, useState, useEffect } from "react";
import { signup } from "../actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthCardEntry,
  SuccessPageTransition,
  PasswordInput,
  AnimatedError,
} from "../_components/auth/AuthAnimations";

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, null);
  const [showSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state?.success, state?.redirectUrl, router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0A1628] p-4 text-right"
      dir="rtl"
    >
      <SuccessPageTransition show={showSuccess} />

      <AuthCardEntry>
        <div className="relative overflow-hidden rounded-2xl bg-[#FAF7F0] p-8 shadow-2xl">
          <div className="absolute top-0 left-0 h-1 w-full bg-[#D4A853]" />

          <h1 className="mb-2 text-3xl font-bold text-[#0A1628]">
            انضم إلى EE37
          </h1>
          <p className="mb-8 text-[#0A1628]/60">أنشئ حسابك للانضمام للدفعة.</p>

          <form action={action} className="space-y-4">
            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                الاسم الكامل
              </label>
              <input
                name="name"
                type="text"
                required
                className={`w-full rounded-lg border bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] transition-colors focus:outline-none ${
                  state?.error?.name
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[#0A1628]/10 focus:ring-2 focus:ring-[#D4A853]"
                }`}
                placeholder="حاتم سليمان "
              />
              <AnimatedError>{state?.error?.name}</AnimatedError>
            </div>

            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                الرقم الجامعي
              </label>
              <input
                name="collegeId"
                type="text"
                required
                maxLength={12}
                className={`w-full rounded-lg border bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] transition-colors focus:outline-none ${
                  state?.error?.collegeId
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[#0A1628]/10 focus:ring-2 focus:ring-[#D4A853]"
                }`}
                placeholder="2020..."
              />
              <p className="mt-1 text-xs text-[#0A1628]/40">
                يجب أن يتكون من 12 رقماً ويبدأ بـ 2018، 2019، أو 2020
              </p>
              <AnimatedError>{state?.error?.collegeId}</AnimatedError>
            </div>

            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                البريد الإلكتروني
              </label>
              <input
                name="email"
                type="email"
                required
                className={`w-full rounded-lg border bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] transition-colors focus:outline-none ${
                  state?.error?.email
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[#0A1628]/10 focus:ring-2 focus:ring-[#D4A853]"
                }`}
                placeholder="Hatim@example.com"
              />
              <AnimatedError>{state?.error?.email}</AnimatedError>
            </div>

            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                كلمة المرور
              </label>
              <PasswordInput name="password" error={!!state?.error?.password} />
              <AnimatedError>{state?.error?.password}</AnimatedError>
            </div>

            <AnimatedError>{state?.error?.form}</AnimatedError>

            <button
              disabled={isPending}
              className="w-full cursor-pointer rounded-lg bg-[#0A1628] py-3 font-bold text-[#D4A853] transition-all hover:bg-[#0A1628]/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#0A1628]/60">
            لديك حساب بالفعل؟{" "}
            <Link
              href="/login"
              className="font-bold text-[#D4A853] hover:underline"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </AuthCardEntry>
    </div>
  );
}
