"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AuthCardEntry,
  SuccessPageTransition,
  AnimatedError,
} from "../_components/auth/AuthAnimations";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function PasswordInput({
  name,
  placeholder = "••••••••",
  error,
  value,
  onChange,
}: {
  name: string;
  placeholder?: string;
  error?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <motion.div
        animate={focused ? { scale: 1.02 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <input
          name={name}
          type={showPassword ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-lg border bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] transition-colors focus:outline-none ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-[#0A1628]/10 focus:ring-2 focus:ring-[#D4A853]"
          }`}
          placeholder={placeholder}
        />
      </motion.div>

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute top-1/2 left-3 -translate-y-1/2 p-1 text-[#0A1628]/40 transition-colors hover:text-[#D4A853] focus:outline-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          {showPassword ? (
            <motion.div
              key="eye-off"
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
              transition={{ duration: 0.2 }}
            >
              <EyeOff size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="eye"
              initial={{ opacity: 0, scale: 0.5, rotate: 20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Eye size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (newPassword.length < 8) {
      setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل");
      return;
    }

    if (!token) {
      setError("رابط إعادة التعيين غير صالح");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
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

  if (!isValidToken) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#0A1628] p-4 text-right"
        dir="rtl"
      >
        <AuthCardEntry>
          <div className="relative overflow-hidden rounded-2xl bg-[#FAF7F0] p-8 shadow-2xl">
            <div className="absolute top-0 left-0 h-1 w-full bg-[#D4A853]" />

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
                <svg
                  className="h-10 w-10 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mb-4 text-2xl font-bold text-[#0A1628]">
                رابط غير صالح
              </h2>
              <p className="mb-6 text-[#0A1628]/60">
                رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block rounded-lg bg-[#0A1628] px-6 py-3 font-bold text-[#D4A853] transition-all hover:bg-[#0A1628]/90 hover:shadow-lg"
              >
                طلب رابط جديد
              </Link>
            </div>
          </div>
        </AuthCardEntry>
      </div>
    );
  }

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
                تعيين كلمة مرور جديدة
              </h1>
              <p className="mb-8 text-[#0A1628]/60">
                أدخل كلمة المرور الجديدة الخاصة بك.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block font-medium text-[#0A1628]">
                    كلمة المرور الجديدة
                  </label>
                  <PasswordInput
                    name="newPassword"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPassword(e.target.value)
                    }
                    error={false}
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-[#0A1628]">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <PasswordInput
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    error={false}
                  />
                </div>

                <AnimatedError>{error}</AnimatedError>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-lg bg-[#0A1628] py-3 font-bold text-[#D4A853] transition-all hover:bg-[#0A1628]/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
                </button>
              </form>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mb-4 text-2xl font-bold text-[#0A1628]">
                تم التغيير بنجاح!
              </h2>
              <p className="mb-6 text-[#0A1628]/60">
                تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور
                الجديدة.
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
