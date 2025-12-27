"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  User,
  X,
  Loader2,
  Camera,
  Upload,
  Zap,
} from "lucide-react";
import { useUploadThing } from "~/lib/uploadthing";

interface SurveyFormProps {
  user?: {
    name: string;
    email: string;
    userId: string;
  } | null;
}

export default function SurveyForm({ user }: SurveyFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    word: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onUploadError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("حجم الصورة كبير جداً (الحد الأقصى 4 ميجا)");
        return;
      }
      setError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.word) return;

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      let imageUrl: string | undefined;

      // Upload image if provided
      if (imageFile) {
        const uploadResult = await startUpload([imageFile]);
        if (uploadResult?.[0]?.ufsUrl) {
          imageUrl = uploadResult[0].ufsUrl;
        }
      }

      // Save submission to database
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          word: formData.word,
          imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل في إرسال المشاركة");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="noise-texture relative min-h-screen overflow-x-hidden bg-[var(--color-paper)]"
      dir="rtl"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="geometric-pattern absolute inset-0 opacity-20" />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="bg-gradient-radial absolute -top-40 right-40 h-[600px] w-[600px] rounded-full from-[var(--color-gold)]/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="bg-gradient-radial absolute -bottom-40 left-40 h-[500px] w-[500px] rounded-full from-[var(--color-copper)]/15 to-transparent blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--color-midnight)]/5 bg-[var(--color-paper)]/80 px-6 py-4 backdrop-blur-xl">
        <Link href="/" className="group">
          <motion.div
            whileHover={{ x: 5, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-midnight)] text-[var(--color-sand)] shadow-lg transition-shadow group-hover:shadow-xl"
          >
            <span className="text-lg font-bold">→</span>
          </motion.div>
        </Link>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[var(--color-gold)]" />
          <span
            className="font-bold text-[var(--color-midnight)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            استبيان الذكريات
          </span>
        </div>
        <div className="w-12" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex w-full flex-1 flex-col px-6 py-12 md:mx-auto md:max-w-lg">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {/* Title Section */}
              <div className="space-y-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)] shadow-[var(--color-gold)]/30 shadow-2xl"
                >
                  <Camera size={40} className="text-white" />
                </motion.div>
                <h1
                  className="text-4xl font-black text-[var(--color-midnight)] md:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  سجل ذكرياتك
                </h1>
                <p className="text-lg text-[var(--color-midnight)]/50">
                  شاركنا لحظتك بكلمة وصورة للذكرى
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-500/20 bg-red-50 p-4 text-center text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="group relative"
                >
                  <label
                    className={`block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ${
                      imagePreview
                        ? "shadow-2xl"
                        : "border-2 border-dashed border-[var(--color-midnight)]/10 bg-[var(--color-midnight)]/5 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/5"
                    } `}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isLoading}
                    />

                    {imagePreview ? (
                      <div className="relative h-full w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)]/60 to-transparent" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            removeImage();
                          }}
                          disabled={isLoading}
                          className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-paper)] text-[var(--color-midnight)] shadow-lg transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                        >
                          <X size={18} />
                        </button>
                        <div className="absolute right-4 bottom-4 rounded-full bg-[var(--color-gold)] px-4 py-2 text-sm font-bold text-[var(--color-midnight)] shadow-lg">
                          تم الاختيار ✓
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-paper)] shadow-sm transition-transform duration-500 group-hover:scale-110">
                          <Camera
                            size={36}
                            className="text-[var(--color-gold)]"
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-[var(--color-midnight)]">
                            أضف صورة
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-midnight)]/40">
                            اختياري • الحد الأقصى 4 ميجا
                          </p>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-[var(--color-paper)]/90 backdrop-blur-sm">
                      <Upload
                        size={32}
                        className="mb-4 animate-bounce text-[var(--color-gold)]"
                      />
                      <div className="h-2 w-3/4 overflow-hidden rounded-full bg-[var(--color-midnight)]/10">
                        <motion.div
                          className="h-full bg-[var(--color-gold)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-[var(--color-midnight)]/60">
                        جاري الرفع... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Input Fields */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-5"
                >
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="mr-1 text-sm font-bold text-[var(--color-midnight)]/70">
                      الاسم
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="اسمك الكريم"
                        disabled={isLoading || !!user?.name}
                        className="w-full rounded-2xl border-2 border-[var(--color-midnight)]/10 bg-white px-6 py-5 text-lg text-[var(--color-midnight)] shadow-sm transition-all duration-300 placeholder:text-[var(--color-midnight)]/20 focus:border-[var(--color-gold)] focus:shadow-lg focus:outline-none disabled:bg-[var(--color-midnight)]/5 disabled:opacity-70"
                      />
                      <User
                        className="absolute top-1/2 left-5 -translate-y-1/2 text-[var(--color-midnight)]/30"
                        size={22}
                      />
                    </div>
                  </div>

                  {/* Word Input */}
                  <div className="space-y-2">
                    <label className="mr-1 text-sm font-bold text-[var(--color-midnight)]/70">
                      كلمة للذكرى
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      value={formData.word}
                      onChange={(e) =>
                        setFormData({ ...formData, word: e.target.value })
                      }
                      placeholder="صف شعورك بكلمة واحدة..."
                      disabled={isLoading}
                      className="w-full rounded-2xl border-2 border-[var(--color-midnight)]/10 bg-white px-6 py-5 text-lg text-[var(--color-midnight)] shadow-sm transition-all duration-300 placeholder:text-[var(--color-midnight)]/20 focus:border-[var(--color-gold)] focus:shadow-lg focus:outline-none disabled:opacity-50"
                    />
                    <div className="flex justify-between px-2">
                      <p className="text-xs text-[var(--color-midnight)]/30">
                        مثال: سعادة، حماس، فخر...
                      </p>
                      <p className="text-xs font-bold text-[var(--color-gold)]">
                        {formData.word.length}/20
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!formData.name || !formData.word || isLoading}
                  className="shimmer-btn mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg font-bold text-[var(--color-midnight)] shadow-[var(--color-gold)]/30 shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      <span>
                        {isUploading ? "جاري رفع الصورة..." : "جاري الإرسال..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>إرسال المشاركة</span>
                      <Send size={20} className="rotate-180" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-1 flex-col items-center justify-center space-y-8 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/30"
              >
                <CheckCircle2 size={64} className="text-white" />
              </motion.div>

              <div className="space-y-3">
                <h2
                  className="text-4xl font-black text-[var(--color-midnight)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  تم الحفظ!
                </h2>
                <p className="mx-auto max-w-xs text-lg text-[var(--color-midnight)]/60">
                  شكراً لك{" "}
                  <span className="font-bold text-[var(--color-gold)]">
                    {formData.name}
                  </span>
                  <br />
                  ذكرياتك محفوظة للأبد
                </p>
              </div>

              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="h-48 w-48 rotate-3 overflow-hidden rounded-[2rem] border-4 border-[var(--color-gold)]/30 shadow-2xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Shared"
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              )}

              <div className="w-full space-y-3 pt-8">
                <Link href="/gallery" className="block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="shimmer-btn w-full rounded-2xl py-5 text-lg font-bold text-[var(--color-midnight)] shadow-[var(--color-gold)]/30 shadow-2xl"
                  >
                    عرض معرض الذكريات
                  </motion.button>
                </Link>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    // Don't reset name if it's from user
                    setFormData({ name: user?.name ?? "", word: "" });
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="block w-full py-4 text-sm font-medium text-[var(--color-midnight)]/40 transition-colors hover:text-[var(--color-gold)]"
                >
                  إرسال مشاركة أخرى
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center">
        <div className="flex items-center justify-center gap-3 text-[var(--color-midnight)]/30">
          <div className="h-[1px] w-12 bg-[var(--color-gold)]/30" />
          <span className="text-xs tracking-widest">
            جامعة السودان للعلوم والتكنولوجيا
          </span>
          <div className="h-[1px] w-12 bg-[var(--color-gold)]/30" />
        </div>
      </footer>
    </div>
  );
}
