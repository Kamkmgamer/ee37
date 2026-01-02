"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AuthCardEntry,
  SuccessPageTransition,
  AnimatedError,
} from "../_components/auth/AuthAnimations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "حدث خطأ. يرجى المحاولة مرة أخرى.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0A1628] p-4 text-right"
      dir="rtl"
    >
      <SuccessPageTransition show={success} />

      <AuthCardEntry>
        <div className="relative overflow-hidden rounded-2xl bg-[#FAF7F0] p-8 shadow-2xl">
          <div className="absolute top-0 left-0 h-1 w-full bg-[#D4A853]" />

          {!success ? (
            <>
              <h1 className="mb-2 text-3xl font-bold text-[#0A1628]">
                نسيت كلمة المرور؟
              </h1>
              <p className="mb-8 text-[#0A1628]/60">
                لا تقلق، سنرسل لك رابطاً لإعادة تعيين كلمة المرور.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block font-medium text-[#0A1628]">
                    البريد الإلكتروني
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#0A1628]/10 bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] transition-colors focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853] focus:outline-none"
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div>

                <AnimatedError>{error}</AnimatedError>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-lg bg-[#0A1628] py-3 font-bold text-[#D4A853] transition-all hover:bg-[#0A1628]/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#0A1628]/60">
                تذكرت كلمة المرور؟{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#D4A853] hover:underline"
                >
                  سجّل الدخول
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#D4A853]/20">
                <svg
                  className="h-10 w-10 text-[#D4A853]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="mb-4 text-2xl font-bold text-[#0A1628]">
                تم إرسال الرابط!
              </h2>
              <p className="mb-6 text-[#0A1628]/60">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى
                التحقق من بريدك الوارد.
              </p>
              <p className="text-sm text-[#0A1628]/40">
                سيتم توجيهك إلى صفحة تسجيل الدخول خلال ثوانٍ...
              </p>
            </div>
          )}
        </div>
      </AuthCardEntry>
    </div>
  );
}
