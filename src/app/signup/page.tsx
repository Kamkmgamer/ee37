"use client";

import { useActionState } from "react";
import { signup } from "../actions/auth";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A1628] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#FAF7F0] p-8 shadow-2xl">
          {/* Decorative blueprint lines */}
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
                className="w-full rounded-lg border border-[#0A1628]/10 bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] focus:ring-2 focus:ring-[#D4A853] focus:outline-none"
                placeholder="حاتم سليمان "
              />
              {state?.error?.name && (
                <p className="mt-1 text-sm text-red-500">{state.error.name}</p>
              )}
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
                className="w-full rounded-lg border border-[#0A1628]/10 bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] focus:ring-2 focus:ring-[#D4A853] focus:outline-none"
                placeholder="2020..."
              />
              <p className="mt-1 text-xs text-[#0A1628]/40">
                يجب أن يتكون من 12 رقماً ويبدأ بـ 2018، 2019، أو 2020
              </p>
              {state?.error?.collegeId && (
                <p className="mt-1 text-sm text-red-500">
                  {state.error.collegeId}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                البريد الإلكتروني
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-[#0A1628]/10 bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] focus:ring-2 focus:ring-[#D4A853] focus:outline-none"
                placeholder="Hatim@example.com"
              />
              {state?.error?.email && (
                <p className="mt-1 text-sm text-red-500">{state.error.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block font-medium text-[#0A1628]">
                كلمة المرور
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-[#0A1628]/10 bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] focus:ring-2 focus:ring-[#D4A853] focus:outline-none"
                placeholder="••••••••"
              />
              {state?.error?.password && (
                <p className="mt-1 text-sm text-red-500">
                  {state.error.password}
                </p>
              )}
            </div>

            {state?.error?.form && (
              <p className="text-center text-sm text-red-500">
                {state.error.form}
              </p>
            )}

            <button
              disabled={isPending}
              className="w-full cursor-pointer rounded-lg bg-[#0A1628] py-3 font-bold text-[#D4A853] transition-colors hover:bg-[#0A1628]/90 disabled:opacity-50"
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
      </motion.div>
    </div>
  );
}
