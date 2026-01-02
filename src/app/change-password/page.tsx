"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ChangePasswordPage() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotOption, setShowForgotOption] = useState(false);

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

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "حدث خطأ. يرجى المحاولة مرة أخرى.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 3000);
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "حدث خطأ. يرجى المحاولة مرة أخرى.");
        return;
      }

      setShowForgotOption(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
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
                تغيير كلمة المرور
              </h1>
              <p className="mb-8 text-[#0A1628]/60">
                {!showForgotOption
                  ? "أدخل كلمة المرور القديمة والجديدة."
                  : "سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني."}
              </p>

              {!showForgotOption ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block font-medium text-[#0A1628]">
                      كلمة المرور القديمة
                    </label>
                    <PasswordInput
                      name="oldPassword"
                      value={oldPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setOldPassword(e.target.value)
                      }
                      error={!!error.includes("القديمة")}
                    />
                  </div>

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
                      error={!!error.includes("مطابقة")}
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
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-[#0A1628]/5 p-4 text-[#0A1628]/60">
                    <p className="mb-2 font-medium">
                      هل نسيت كلمة المرور القديمة؟
                    </p>
                    <p>
                      سنرسل رابطاً لإعادة تعيين كلمة المرور إلى بريدك الإلكتروني
                      المسجل.
                    </p>
                  </div>

                  <AnimatedError>{error}</AnimatedError>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowForgotOption(false)}
                      disabled={isLoading}
                      className="flex-1 rounded-lg border border-[#0A1628]/20 py-3 font-bold text-[#0A1628] transition-all hover:bg-[#0A1628]/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                      className="flex-1 cursor-pointer rounded-lg bg-[#0A1628] py-3 font-bold text-[#D4A853] transition-all hover:bg-[#0A1628]/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "جاري الإرسال..." : "إرسال الرابط"}
                    </button>
                  </div>
                </div>
              )}

              {!showForgotOption && (
                <div className="mt-6 border-t border-[#0A1628]/10 pt-4">
                  <button
                    onClick={() => setShowForgotOption(true)}
                    className="text-sm font-medium text-[#D4A853] hover:underline"
                  >
                    لا أتذكر كلمة المرور القديمة
                  </button>
                </div>
              )}
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
                {!showForgotOption ? "تم التغيير بنجاح!" : "تم إرسال الرابط!"}
              </h2>
              <p className="mb-6 text-[#0A1628]/60">
                {!showForgotOption
                  ? "تم تغيير كلمة المرور بنجاح."
                  : "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من بريدك الوارد."}
              </p>
              <p className="text-sm text-[#0A1628]/40">
                سيتم توجيهك إلى الملف الشخصي خلال ثوانٍ...
              </p>
            </div>
          )}
        </div>
      </AuthCardEntry>
    </div>
  );
}
