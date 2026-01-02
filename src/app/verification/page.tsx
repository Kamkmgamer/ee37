"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type VerificationState =
  | "input"
  | "sending"
  | "verifying"
  | "success"
  | "error";

export default function VerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";
  const name = searchParams.get("name") ?? "";

  const [state, setState] = useState<VerificationState>("input");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [resendDisabled, setResendDisabled] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  useEffect(() => {
    if (state === "success") {
      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setResendDisabled(false);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (index: number, value: string) => {
    const newCode = [...code];

    if (value.length > 1) {
      newCode[index] = value.slice(-1);
      setCode(newCode);

      if (value !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (value === "") {
      newCode[index] = "";
      setCode(newCode);

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] ?? "";
    }
    setCode(newCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      setError("يرجى إدخال الكود كاملاً");
      return;
    }

    setState("verifying");
    setError("");

    try {
      const response = await fetch("/api/verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: fullCode,
        }),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dataRaw = await response.json();
      const data = dataRaw as { error?: string };

      if (response.ok) {
        setState("success");
      } else {
        setError(data.error ?? "فشل التحقق. يرجى المحاولة مرة أخرى.");
        setState("error");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
      setState("error");
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled || timeLeft > 0) return;

    setState("sending");
    setError("");

    try {
      const response = await fetch("/api/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dataRaw = await response.json();
      const data = dataRaw as { error?: string };

      if (response.ok) {
        setTimeLeft(30 * 60);
        setResendDisabled(true);
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error ?? "فشل إرسال الكود. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setState("input");
    }
  };

  if (!email) return null;

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#0A1628] p-4 text-right"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-[#FAF7F0] p-8 shadow-2xl"
        style={{ width: "100%", maxWidth: "480px" }}
      >
        <div className="absolute top-0 left-0 h-1 w-full bg-[#D4A853]" />

        <AnimatePresence mode="wait">
          {state === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
              >
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  />
                </svg>
              </motion.div>
              <h2 className="mb-2 text-2xl font-bold text-[#0A1628]">
                تم التحقق بنجاح!
              </h2>
              <p className="text-[#0A1628]/60">
                جاري توجيهك إلى الصفحة الرئيسية...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="mb-2 text-3xl font-bold text-[#0A1628]">
                التحقق من البريد الإلكتروني
              </h1>
              <p className="mb-8 text-[#0A1628]/60">
                تم إرسال كود التحقق إلى{" "}
                <span className="font-semibold text-[#D4A853]">{email}</span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  dir="ltr"
                  className="flex justify-center gap-3"
                  onPaste={handlePaste}
                >
                  {code.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="h-14 w-12 rounded-lg border-2 bg-[#0A1628]/5 text-center text-2xl font-bold text-[#0A1628] transition-all focus:border-[#D4A853] focus:ring-2 focus:ring-[#D4A853]/20 focus:outline-none"
                        disabled={state === "sending" || state === "verifying"}
                      />
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center text-sm text-red-500"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={state === "sending" || state === "verifying"}
                    className="w-full cursor-pointer rounded-lg bg-[#0A1628] py-3 font-bold text-[#D4A853] transition-all hover:bg-[#0A1628]/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {state === "verifying" ? "جاري التحقق..." : "تأكيد الكود"}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendDisabled || timeLeft > 0}
                      className="text-[#D4A853] hover:underline disabled:cursor-not-allowed disabled:text-[#0A1628]/40"
                    >
                      إرسال كود جديد
                    </button>
                    <span className="text-[#0A1628]/60">
                      {timeLeft > 0 ? (
                        <>متبقي: {formatTime(timeLeft)}</>
                      ) : (
                        <span className="text-green-600">
                          يمكنك إعادة الإرسال
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </form>

              <p className="mt-8 text-center text-sm text-[#0A1628]/60">
                هل تريد استخدام بريد إلكتروني مختلف؟{" "}
                <Link
                  href="/signup"
                  className="font-bold text-[#D4A853] hover:underline"
                >
                  إعادة التسجيل
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
