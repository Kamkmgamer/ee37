"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit2,
  Save,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Calendar,
  Check,
} from "lucide-react";
import { useToast } from "../ui/Toast";

interface Submission {
  id: string;
  name: string;
  word: string | null;
  imageUrl: string | null;
  createdAt: string;
  userId: string | null;
  isAnonymous: boolean;
  semester: number | null;
  batchId: string | null;
}

interface MySubmissionsProps {
  userId: string;
  isOwnProfile: boolean;
}

const SEMESTER_LABELS: Record<number, string> = {
  1: "الفصل الأول",
  2: "الفصل الثاني",
  3: "الفصل الثالث",
  4: "الفصل الرابع",
  5: "الفصل الخامس",
};

const warmGradients = [
  "from-amber-200 via-orange-200 to-rose-200",
  "from-rose-200 via-pink-200 to-violet-200",
  "from-emerald-200 via-teal-200 to-cyan-200",
  "from-violet-200 via-purple-200 to-indigo-200",
  "from-sky-200 via-blue-200 to-indigo-200",
  "from-yellow-200 via-amber-200 to-orange-200",
];

const hashUUID = (uuid: string): number => {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export default function MySubmissions({
  userId,
  isOwnProfile,
}: MySubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWord, setEditWord] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    void fetchSubmissions();
  }, [userId]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/submissions/manage?userId=${userId}`);
      const data = (await response.json()) as Submission[];
      setSubmissions(data ?? []);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      const response = await fetch(`/api/submissions/manage?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        toast.success("تم حذف الصورة بنجاح");
      } else {
        toast.error("فشل في حذف الصورة");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const startEditing = (submission: Submission) => {
    setEditingId(submission.id);
    setEditWord(submission.word ?? "");
  };

  const saveWord = async (id: string) => {
    try {
      const response = await fetch("/api/submissions/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, word: editWord }),
      });

      if (response.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, word: editWord || null } : s)),
        );
        setEditingId(null);
        toast.success("تم تحديث الكلمة بنجاح");
      } else {
        toast.error("فشل في تحديث الكلمة");
      }
    } catch {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    const total = submissions.length;
    let newIndex = lightboxIndex;
    if (direction === "prev") {
      newIndex = (lightboxIndex - 1 + total) % total;
    } else {
      newIndex = (lightboxIndex + 1) % total;
    }
    setLightboxIndex(newIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, lightboxIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gold)] border-t-transparent" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="elegant-card rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-midnight)]/5">
          <ImageIcon size={32} className="text-[var(--color-midnight)]/30" />
        </div>
        <p className="text-[var(--color-midnight)]/60">لم يتم رفع أي صور بعد</p>
        {isOwnProfile && (
          <a
            href="/survey"
            className="mt-2 inline-block text-[var(--color-gold)] hover:underline"
          >
            أضف صورك الأولى
          </a>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {submissions.map((submission, index) => {
          const gradientClass =
            warmGradients[hashUUID(submission.id) % warmGradients.length];

          return (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square"
            >
              {submission.imageUrl ? (
                <img
                  src={submission.imageUrl}
                  alt=""
                  className="h-full w-full cursor-pointer rounded-xl object-cover transition-transform duration-300 hover:scale-105"
                  onClick={() => openLightbox(index)}
                />
              ) : (
                <div
                  className={`h-full w-full rounded-xl bg-gradient-to-br ${gradientClass}`}
                />
              )}

              {isOwnProfile && confirmDeleteId !== submission.id && (
                <div className="absolute right-0 bottom-0 left-0 flex justify-center gap-1 bg-gradient-to-t from-[var(--color-midnight)]/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => startEditing(submission)}
                    className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                    title="تعديل الكلمة"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => confirmDelete(submission.id)}
                    disabled={deletingId === submission.id}
                    className="rounded-full bg-red-500/80 p-2 text-white hover:bg-red-500 disabled:opacity-50"
                    title="حذف"
                  >
                    {deletingId === submission.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              )}

              {isOwnProfile && confirmDeleteId === submission.id && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-[var(--color-midnight)]/90 p-2">
                  <p className="text-sm font-medium text-white">تأكيد الحذف؟</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(submission.id)}
                      disabled={deletingId === submission.id}
                      className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {deletingId === submission.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {editingId === submission.id && (
                <div className="absolute inset-0 rounded-xl bg-[var(--color-midnight)]/90 p-2">
                  <input
                    type="text"
                    maxLength={20}
                    value={editWord}
                    onChange={(e) => setEditWord(e.target.value)}
                    className="w-full rounded-lg border-0 bg-white/10 px-2 py-1 text-center text-sm text-white placeholder:text-white/50 focus:bg-white/20 focus:outline-none"
                    placeholder="كلمة..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveWord(submission.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <div className="mt-2 flex justify-center gap-2">
                    <button
                      onClick={() => saveWord(submission.id)}
                      className="rounded-full bg-[var(--color-gold)] p-1.5 text-[var(--color-midnight)]"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-full bg-white/20 p-1.5 text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {lightboxOpen && submissions[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-midnight)]/95 p-4 backdrop-blur-xl ${
              isFullscreen ? "!p-0" : ""
            }`}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className={`relative overflow-hidden rounded-[2rem] bg-[var(--color-paper)] shadow-2xl ${
                isFullscreen ? "h-full w-full !rounded-none" : "w-full max-w-md"
              }`}
            >
              {(() => {
                const current = submissions[lightboxIndex];
                if (!current) return null;

                return (
                  <>
                    <button
                      onClick={() => setLightboxOpen(false)}
                      className="absolute top-6 left-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-sand)] transition-colors hover:bg-red-500"
                    >
                      <X size={18} />
                    </button>

                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="absolute top-6 right-20 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-sand)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-midnight)]"
                    >
                      {isFullscreen ? (
                        <Minimize2 size={18} />
                      ) : (
                        <Maximize2 size={18} />
                      )}
                    </button>

                    <div className="relative aspect-square">
                      {current.imageUrl ? (
                        <img
                          src={current.imageUrl}
                          alt=""
                          className={`h-full w-full object-cover ${
                            isFullscreen ? "object-contain" : ""
                          }`}
                        />
                      ) : (
                        <div
                          className={`h-full w-full bg-gradient-to-br ${
                            warmGradients[
                              hashUUID(current.id) % warmGradients.length
                            ]
                          } flex items-center justify-center`}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-paper)] via-transparent to-transparent" />
                    </div>

                    <div className="relative -mt-16 p-6 text-center">
                      {current.word && (
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-4 py-2 text-lg font-bold text-[var(--color-midnight)]">
                          {current.word}
                        </div>
                      )}

                      {current.semester && (
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-midnight)]/50">
                          <Calendar size={14} />
                          {SEMESTER_LABELS[current.semester]}
                        </div>
                      )}

                      <p className="mt-2 text-xs text-[var(--color-gold)]">
                        {lightboxIndex + 1} / {submissions.length}
                      </p>
                    </div>
                  </>
                );
              })()}

              {submissions.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox("prev")}
                    className="absolute top-1/2 left-4 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-sand)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-midnight)]"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={() => navigateLightbox("next")}
                    className="absolute top-1/2 right-4 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-sand)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-midnight)]"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
