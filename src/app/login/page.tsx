"use client";

import { useActionState, useState, useEffect } from "react";
import { login } from "../actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthCardEntry,
  SuccessPageTransition,
  PasswordInput,
  AnimatedError,
} from "../_components/auth/AuthAnimations";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0A1628] p-4 text-right"
      dir="rtl"
    >
      <SuccessPageTransition show={showSuccess} />

      <AuthCardEntry>
        <div className="relative overflow-hidden rounded-2xl bg-[#FAF7F0] p-8 shadow-2xl">
          {/* Decorative blueprint lines */}
          <div className="absolute top-0 left-0 h-1 w-full bg-[#D4A853]" />

          <h1 className="mb-2 text-3xl font-bold text-[#0A1628]">
            مرحباً بعودتك
          </h1>
          <p className="mb-8 text-[#0A1628]/60">
            سجل الدخول للوصول إلى ذكريات الدفعة.
          </p>

          <form action={action} className="space-y-4">
            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                البريد الإلكتروني أو الرقم الجامعي
              </label>
              <input
                name="identifier"
                type="text"
                required
                className={`w-full rounded-lg border bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] transition-colors focus:outline-none ${
                  state?.error?.identifier
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[#0A1628]/10 focus:ring-2 focus:ring-[#D4A853]"
                }`}
                placeholder="2020... أو البريد الإلكتروني"
              />
              <AnimatedError>{state?.error?.identifier}</AnimatedError>
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
              disabled={isPending || showSuccess}
              className="w-full cursor-pointer rounded-lg bg-[#0A1628] py-3 font-bold text-[#D4A853] transition-all hover:bg-[#0A1628]/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending || showSuccess ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#0A1628]/60">
            ليس لديك حساب؟{" "}
            <Link
              href="/signup"
              className="font-bold text-[#D4A853] hover:underline"
            >
              أنشئ حساباً
            </Link>
          </p>
        </div>
      </AuthCardEntry>
    </div>
  );
}
