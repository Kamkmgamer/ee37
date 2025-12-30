"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "~/trpc/react";

type ReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "violence"
  | "nudity"
  | "misinformation"
  | "other";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "post" | "comment" | "user";
}

const reasons: { val: ReportReason; label: string }[] = [
  { val: "spam", label: "محتوى غير مرغوب فيه (Spam)" },
  { val: "harassment", label: "تحرش أو مضايقة" },
  { val: "hate_speech", label: "خطاب كراهية" },
  { val: "violence", label: "عنف أو تهديد" },
  { val: "nudity", label: "محتوى جنسي أو عري" },
  { val: "misinformation", label: "معلومات مضللة" },
  { val: "other", label: "سبب آخر" },
];

export function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [details, setDetails] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitReport = api.reports.create.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setSelectedReason(null);
        setDetails("");
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    submitReport.mutate({
      targetType,
      targetId,
      reason: selectedReason,
      details: details.trim() || undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-midnight text-xl font-bold">
                  إبلاغ عن محتوى
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <div className="mb-4 rounded-full bg-green-100 p-4 text-green-600">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="text-midnight text-xl font-bold">
                    شكراً لتبليغك
                  </h4>
                  <p className="mt-2 text-gray-600">
                    لقد استلمنا بلاغك وسنقوم بمراجعته في أقرب وقت ممكن.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 text-right"
                  dir="rtl"
                >
                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-700">
                      لماذا تقوم بالإبلاغ عن هذا{" "}
                      {targetType === "post"
                        ? "المنشور"
                        : targetType === "comment"
                          ? "التعليق"
                          : "المستخدم"}
                      ؟
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {reasons.map((reason) => (
                        <button
                          key={reason.val}
                          type="button"
                          onClick={() => setSelectedReason(reason.val)}
                          className={`flex items-center gap-3 rounded-xl border-2 p-3 text-right transition-all ${
                            selectedReason === reason.val
                              ? "border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]"
                              : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              selectedReason === reason.val
                                ? "border-[#D4AF37]"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedReason === reason.val && (
                              <div className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
                            )}
                          </div>
                          <span className="font-medium">{reason.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      تفاصيل إضافية (اختياري)
                    </label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="أخبرنا المزيد عن المشكلة..."
                      className="min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-right focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={!selectedReason || submitReport.isPending}
                      className="bg-midnight hover:bg-midnight/90 flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all disabled:opacity-50"
                    >
                      {submitReport.isPending ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <AlertTriangle size={20} />
                      )}
                      إرسال البلاغ
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl bg-gray-100 py-3.5 font-bold text-gray-700 transition-all hover:bg-gray-200"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
