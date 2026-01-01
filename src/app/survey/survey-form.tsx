"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  User,
  X,
  Loader2,
  Camera,
  Zap,
  Ghost,
  ImagePlus,
  Copy,
} from "lucide-react";
import { useUploadThing } from "~/lib/uploadthing";

interface SurveyFormProps {
  user?: {
    name: string;
    email: string;
    userId: string;
  } | null;
}

interface ImageUpload {
  id: string;
  file: File;
  preview: string;
  word: string;
}

const SEMESTER_OPTIONS = [
  { value: 1, label: "الفصل الأول" },
  { value: 2, label: "الفصل الثاني" },
  { value: 3, label: "الفصل الثالث" },
  { value: 4, label: "الفصل الرابع" },
  { value: 5, label: "الفصل الخامس" },
];

export default function SurveyForm({ user }: SurveyFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
  });
  const [semester, setSemester] = useState<number | null>(null);
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [commonWord, setCommonWord] = useState("");
  const [useCommonWord, setUseCommonWord] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLateSubmission, setIsLateSubmission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      const maxTotalSize = 40 * 1024 * 1024;
      const currentSize = images.reduce((acc, img) => acc + img.file.size, 0);
      const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);

      if (currentSize + newFilesSize > maxTotalSize) {
        setError("إجمالي حجم الصور لا يتجاوز 40 ميجابايت");
        return;
      }

      const newImages: ImageUpload[] = files
        .map((file) => {
          if (file.size > 4 * 1024 * 1024) {
            setError("حجم كل صورة لا يتجاوز 4 ميجابايت");
            return null;
          }
          return {
            id: generateId(),
            file,
            preview: URL.createObjectURL(file),
            word: "",
          };
        })
        .filter(Boolean) as ImageUpload[];

      setImages((prev) => [...prev, ...newImages]);
      setError(null);
    },
    [images],
  );

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const updateImageWord = (id: string, word: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, word } : img)),
    );
  };

  const applyCommonWordToAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, word: commonWord })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || images.length === 0) {
      setError("الاسم وصورة واحدة على الأقل مطلوبان");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const files = images.map((img) => img.file);
      const uploadResult = await startUpload(files);

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("فشل في رفع الصور");
      }

      const imagesData = uploadResult.map((result, index) => ({
        imageUrl: result.ufsUrl,
        imageName: images[index]?.file.name ?? "image",
        word: useCommonWord ? commonWord : images[index]?.word || null,
      }));

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          images: imagesData,
          semester,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل في إرسال المشاركة");
      }

      const data = (await response.json()) as {
        isLate?: boolean;
      };
      setIsLateSubmission(data.isLate ?? false);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setSubmitted(false);
    setIsLateSubmission(false);
    setFormData({ name: user?.name ?? "" });
    setSemester(null);
    setImages([]);
    setCommonWord("");
    setUseCommonWord(false);
    setIsAnonymous(false);
  };

  return (
    <div
      className="noise-texture relative min-h-screen overflow-x-hidden bg-[var(--color-paper)]"
      dir="rtl"
    >
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
        <div className="w-12" />
      </header>

      <main className="relative z-10 flex w-full flex-1 flex-col px-6 py-12 md:mx-auto md:max-w-3xl">
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
                  شاركنا لحظاتك بصور وكلمات للذكرى
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-5"
                >
                  <label className="mr-1 text-sm font-bold text-[var(--color-midnight)]/70">
                    الفصل الدراسي (اختياري)
                  </label>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {SEMESTER_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() =>
                          setSemester(semester === s.value ? null : s.value)
                        }
                        className={`rounded-xl border-2 py-3 text-sm font-bold transition-all duration-300 ${
                          semester === s.value
                            ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-midnight)]"
                            : "border-[var(--color-midnight)]/10 bg-white text-[var(--color-midnight)] hover:border-[var(--color-gold)]/50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {semester && (
                    <p className="text-xs text-[var(--color-gold)]">
                      ✓ سيتم رفع الصور إلى خادم الفصل {semester}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <label className="text-sm font-bold text-[var(--color-midnight)]/70">
                    الصور ({images.length})
                  </label>

                  <label
                    className={`block cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-[var(--color-midnight)]/10 bg-[var(--color-midnight)]/5 transition-all duration-500 hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/5 ${
                      images.length > 0 ? "border-solid bg-transparent" : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isLoading}
                    />

                    {images.length === 0 ? (
                      <div className="flex h-48 w-full flex-col items-center justify-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-paper)] shadow-sm transition-transform duration-500 group-hover:scale-110">
                          <ImagePlus
                            size={36}
                            className="text-[var(--color-gold)]"
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-[var(--color-midnight)]">
                            أضف صورك
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-midnight)]/40">
                            يمكنك اختيار عدة صور • الحد الأقصى 40 ميجابايت
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4 md:grid-cols-5">
                        {images.map((img) => (
                          <motion.div
                            key={img.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group relative aspect-square"
                          >
                            <img
                              src={img.preview}
                              alt=""
                              className="h-full w-full rounded-xl object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removeImage(img.id);
                              }}
                              disabled={isLoading}
                              className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                            >
                              <X size={14} />
                            </button>
                            <input
                              type="text"
                              placeholder="كلمة..."
                              maxLength={20}
                              value={img.word}
                              onChange={(e) =>
                                updateImageWord(img.id, e.target.value)
                              }
                              disabled={isLoading || useCommonWord}
                              className="absolute right-0 bottom-0 left-0 w-full rounded-b-xl border-0 bg-[var(--color-midnight)]/60 px-2 py-1.5 text-center text-xs text-white placeholder:text-white/50 focus:bg-[var(--color-midnight)]/80 focus:outline-none"
                            />
                          </motion.div>
                        ))}

                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-midnight)]/20 text-[var(--color-midnight)]/40 transition-colors hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/5 hover:text-[var(--color-gold)]">
                          <ImagePlus size={24} />
                          <span className="mt-1 text-xs">إضافة</span>
                        </label>
                      </div>
                    )}
                  </label>
                </motion.div>

                {images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-bold text-[var(--color-midnight)]">
                        <Copy size={16} className="text-[var(--color-gold)]" />
                        إضافة نفس الكلمة لجميع الصور
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseCommonWord(!useCommonWord)}
                        className={`relative h-8 w-14 rounded-full transition-colors duration-300 ${
                          useCommonWord
                            ? "bg-[var(--color-gold)]"
                            : "bg-[var(--color-midnight)]/10"
                        }`}
                      >
                        <motion.div
                          animate={{
                            x: useCommonWord ? 28 : 4,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute top-1 left-0 h-6 w-6 rounded-full bg-white shadow-lg"
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {useCommonWord && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={20}
                              value={commonWord}
                              onChange={(e) => setCommonWord(e.target.value)}
                              placeholder="كلمة واحدة للكل..."
                              disabled={isLoading}
                              className="flex-1 rounded-xl border-2 border-[var(--color-midnight)]/10 bg-white px-4 py-3 text-sm text-[var(--color-midnight)] placeholder:text-[var(--color-midnight)]/20 focus:border-[var(--color-gold)] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={applyCommonWordToAll}
                              disabled={!commonWord || isLoading}
                              className="rounded-xl bg-[var(--color-gold)] px-4 py-3 text-sm font-bold text-[var(--color-midnight)] transition-colors hover:bg-[var(--color-gold)]/80 disabled:opacity-50"
                            >
                              تطبيق
                            </button>
                          </div>
                          <p className="mt-2 text-xs text-[var(--color-midnight)]/40">
                            مثال: سعادة، حماس، فخر... (اختياري)
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-5"
                >
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

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex items-center justify-end gap-3"
                  >
                    <label className="cursor-pointer text-sm font-medium text-[var(--color-midnight)]/60">
                      إخفاء اسمي
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      disabled={isLoading}
                      className={`relative h-8 w-14 rounded-full transition-colors duration-300 ${
                        isAnonymous
                          ? "bg-[var(--color-gold)]"
                          : "bg-[var(--color-midnight)]/10"
                      }`}
                    >
                      <motion.div
                        animate={{
                          x: isAnonymous ? 28 : 4,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="absolute top-1 left-0 h-6 w-6 rounded-full bg-white shadow-lg"
                      />
                    </button>
                  </motion.div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!formData.name || images.length === 0 || isLoading}
                  className="shimmer-btn mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg font-bold text-[var(--color-midnight)] shadow-[var(--color-gold)]/30 shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      <span>
                        {isUploading ? `جاري رفع الصور...` : "جاري الإرسال..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>إرسال {images.length} صورة/صور</span>
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
                  {isLateSubmission ? "تم التسجيل متأخراً!" : "تم الحفظ!"}
                </h2>
                <p className="mx-auto max-w-xs text-lg text-[var(--color-midnight)]/60">
                  {isAnonymous ? (
                    <>
                      شكراً لك،{" "}
                      <span className="font-bold text-[var(--color-gold)]">
                        مجهول
                      </span>
                      <br />
                      ذكرياتك محفوظة للأبد
                    </>
                  ) : (
                    <>
                      شكراً لك{" "}
                      <span className="font-bold text-[var(--color-gold)]">
                        {formData.name}
                      </span>
                      <br />
                      ذكرياتك محفوظة للأبد
                    </>
                  )}
                </p>
                {isLateSubmission && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700"
                  >
                    <Ghost size={16} />
                    <span>تسجيل متأخر - يظهر اسمك فقط للإدارة</span>
                  </motion.div>
                )}
              </div>

              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-3 gap-2 rounded-2xl border-4 border-[var(--color-gold)]/30 p-2"
                >
                  {images.slice(0, 6).map((img, i) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="aspect-square overflow-hidden rounded-xl"
                    >
                      <img
                        src={img.preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  ))}
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
                  onClick={resetForm}
                  className="block w-full py-4 text-sm font-medium text-[var(--color-midnight)]/40 transition-colors hover:text-[var(--color-gold)]"
                >
                  إرسال مشاركة أخرى
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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
