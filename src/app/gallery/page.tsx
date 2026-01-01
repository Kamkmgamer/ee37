"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  X,
  User,
  Quote,
  EyeOff,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { PageHeader } from "../_components/PageHeader";

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

type FilterState =
  | { type: "all" }
  | { type: "year"; year: number }
  | { type: "semester"; semester: number };

const SEMESTER_LABELS: Record<number, string> = {
  1: "الفصل الأول",
  2: "الفصل الثاني",
  3: "الفصل الثالث",
  4: "الفصل الرابع",
  5: "الفصل الخامس",
};

const YEAR_LABELS: Record<number, string> = {
  1: "السنة الأولى",
  2: "السنة الثانية",
  3: "السنة الثالثة",
};

const YEAR_SEMESTERS: Record<number, number[]> = {
  1: [1, 2],
  2: [3, 4],
  3: [5],
};

const getYearFromSemester = (semester: number): number => {
  if (semester <= 2) return 1;
  if (semester <= 4) return 2;
  return 3;
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

const getCardStyle = (index: number) => {
  const seed = index * 7919;
  const rotation = ((seed % 14) - 7) * 0.7;
  const scale = 1 + (seed % 5) * 0.01;
  return { rotation, scale };
};

export default function GalleryPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Submission | null>(null);
  const [filterState, setFilterState] = useState<FilterState>({ type: "all" });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tempFilter, setTempFilter] = useState<FilterState>({ type: "all" });

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data: { submissions?: Submission[] }) => {
        setSubmissions(data.submissions ?? []);
        setFilteredSubmissions(data.submissions ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = [...submissions];

    if (filterState.type === "year") {
      const semesters = YEAR_SEMESTERS[filterState.year] ?? [];
      filtered = filtered.filter(
        (s) => s.semester && semesters.includes(s.semester),
      );
    } else if (filterState.type === "semester") {
      filtered = filtered.filter((s) => s.semester === filterState.semester);
    }

    setFilteredSubmissions(filtered);
  }, [filterState, submissions]);

  const groupSubmissionsByTime = useCallback((subs: Submission[]) => {
    const groups: Record<string, Submission[]> = {};

    subs.forEach((sub) => {
      if (sub.semester) {
        const year = getYearFromSemester(sub.semester);
        const key = `year-${year}-semester-${sub.semester}`;
        groups[key] ??= [];
        groups[key].push(sub);
      } else {
        const key = "no-semester";
        groups[key] ??= [];
        groups[key].push(sub);
      }
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "no-semester") return 1;
      if (b === "no-semester") return -1;

      const aParts = a.split("-");
      const bParts = b.split("-");
      const aYear = Number(aParts[2]);
      const bYear = Number(bParts[2]);
      const aSem = Number(aParts[4]);
      const bSem = Number(bParts[4]);

      if (aYear !== bYear) return bYear - aYear;
      return bSem - aSem;
    });

    return sortedKeys.map((key) => ({
      key,
      title:
        key === "no-semester"
          ? "بدون تصنيف"
          : `${YEAR_LABELS[getYearFromSemester(Number(key.split("-")[3]))]} - ${SEMESTER_LABELS[Number(key.split("-")[3])]}`,
      submissions: groups[key],
    }));
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    const card = filteredSubmissions[index];
    if (card) setSelectedCard(card);
  };

  const navigateLightbox = useCallback(
    (direction: "prev" | "next") => {
      const total = filteredSubmissions.length;
      let newIndex = lightboxIndex;
      if (direction === "prev") {
        newIndex = (lightboxIndex - 1 + total) % total;
      } else {
        newIndex = (lightboxIndex + 1) % total;
      }
      setLightboxIndex(newIndex);
      const card = filteredSubmissions[newIndex];
      if (card) setSelectedCard(card);
    },
    [filteredSubmissions, lightboxIndex],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCard) return;
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "ArrowRight") navigateLightbox("next");
      if (e.key === "Escape") setSelectedCard(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCard, lightboxIndex, navigateLightbox]);

  const hasBatches = submissions.some((s) => s.batchId);
  const currentFilterLabel =
    filterState.type === "all"
      ? "الكل"
      : filterState.type === "year"
        ? YEAR_LABELS[filterState.year]
        : SEMESTER_LABELS[filterState.semester];

  const groupedSubmissions = groupSubmissionsByTime(filteredSubmissions);

  return (
    <div
      className="noise-texture relative min-h-screen overflow-x-hidden bg-[var(--color-paper)]"
      dir="rtl"
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="geometric-pattern absolute inset-0 opacity-20" />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="bg-gradient-radial absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full from-[var(--color-gold)]/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="bg-gradient-radial absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full from-[var(--color-copper)]/15 to-transparent blur-3xl"
        />
      </div>

      <PageHeader
        title="معرض الذكريات"
        showBack={true}
        rightAction={
          <Link href="/survey">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)] text-white shadow-[var(--color-gold)]/30 shadow-lg"
            >
              <Plus size={22} />
            </motion.div>
          </Link>
        }
        leftAction={
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setTempFilter(filterState);
              setShowFilterModal(true);
            }}
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-midnight)]/10 text-[var(--color-midnight)] transition-colors hover:bg-[var(--color-midnight)]/20"
          >
            <Filter size={20} />
            {filterState.type !== "all" && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[var(--color-gold)]" />
            )}
          </motion.button>
        }
      />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)] shadow-[var(--color-gold)]/30 shadow-2xl"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </motion.div>

          <h1
            className="mb-4 text-4xl font-black text-[var(--color-midnight)] md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            لحظات
            <span className="text-[var(--color-gold)]"> الدفعة ٣٧</span>
          </h1>
          <p className="mx-auto max-w-md text-xl text-[var(--color-midnight)]/50">
            كل صورة تحكي قصة، كل كلمة تحمل ذكرى
          </p>

          {filterState.type !== "all" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)]/20 px-4 py-2 text-[var(--color-midnight)]"
            >
              <Calendar size={16} />
              <span className="font-medium">{currentFilterLabel}</span>
              <button
                onClick={() => setFilterState({ type: "all" })}
                className="mr-2 rounded-full p-1 hover:bg-[var(--color-gold)]/30"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mx-auto mt-8 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent"
          />
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-16 w-16 rounded-full border-4 border-[var(--color-gold)]/20 border-t-[var(--color-gold)]"
            />
            <p className="text-[var(--color-midnight)]/40">جاري التحميل...</p>
          </div>
        ) : submissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[3rem] bg-[var(--color-midnight)]/5">
              <User size={64} className="text-[var(--color-midnight)]/20" />
            </div>
            <h2
              className="mb-3 text-2xl font-bold text-[var(--color-midnight)]/40"
              style={{ fontFamily: "var(--font-display)" }}
            >
              لا توجد ذكريات بعد
            </h2>
            <p className="mb-8 text-[var(--color-midnight)]/30">
              كن أول من يخلد لحظاته!
            </p>
            <Link href="/survey">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="shimmer-btn rounded-2xl px-8 py-4 font-bold text-[var(--color-midnight)] shadow-[var(--color-gold)]/20 shadow-xl"
              >
                أضف أول ذكرى
              </motion.button>
            </Link>
          </motion.div>
        ) : filteredSubmissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[3rem] bg-[var(--color-midnight)]/5">
              <Calendar size={64} className="text-[var(--color-midnight)]/20" />
            </div>
            <h2
              className="mb-3 text-2xl font-bold text-[var(--color-midnight)]/40"
              style={{ fontFamily: "var(--font-display)" }}
            >
              لا توجد ذكريات في هذا الفصل
            </h2>
            <p className="mb-8 text-[var(--color-midnight)]/30">
              جرّب تصفية أخرى أو أضف صورك!
            </p>
            <button
              onClick={() => setFilterState({ type: "all" })}
              className="shimmer-btn rounded-2xl px-8 py-4 font-bold text-[var(--color-midnight)] shadow-[var(--color-gold)]/20 shadow-xl"
            >
              عرض الكل
            </button>
          </motion.div>
        ) : (
          <>
            {groupedSubmissions.map((group) => {
              const groupSubs = group.submissions ?? [];
              return (
                <div key={group.key} className="mb-12">
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6 flex items-center gap-3 text-xl font-bold text-[var(--color-midnight)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <span className="h-1 flex-1 rounded-full bg-gradient-to-r from-[var(--color-gold)] to-transparent" />
                    {group.title}
                    <span className="h-1 flex-1 rounded-full bg-gradient-to-l from-[var(--color-gold)] to-transparent" />
                  </motion.h2>

                  <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
                    {groupSubs.map((submission, index) => {
                      const { rotation } = getCardStyle(
                        submissions.findIndex((s) => s.id === submission.id),
                      );
                      const gradientClass =
                        warmGradients[index % warmGradients.length];
                      const hasBatchSiblings =
                        hasBatches &&
                        submission.batchId &&
                        groupSubs.filter(
                          (s) => s.batchId === submission.batchId,
                        ).length > 1;

                      return (
                        <motion.div
                          key={submission.id}
                          layoutId={`card-${submission.id}`}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay:
                              groupedSubmissions.indexOf(group) * 0.1 +
                              index * 0.05,
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          whileHover={{
                            scale: 1.03,
                            rotate: 0,
                            y: -8,
                            zIndex: 30,
                          }}
                          style={{ rotate: rotation }}
                          onClick={() =>
                            openLightbox(
                              filteredSubmissions.findIndex(
                                (s) => s.id === submission.id,
                              ),
                            )
                          }
                          className="group mb-4 break-inside-avoid"
                        >
                          <div
                            className={`elegant-card relative overflow-hidden rounded-3xl ${
                              hasBatchSiblings
                                ? "ring-2 ring-[var(--color-gold)] ring-offset-2 ring-offset-[var(--color-paper)]"
                                : ""
                            }`}
                          >
                            <div
                              className={`aspect-[3/4] ${
                                !submission.imageUrl
                                  ? `bg-gradient-to-br ${gradientClass}`
                                  : ""
                              }`}
                            >
                              {submission.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={submission.imageUrl}
                                  alt={submission.name}
                                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                    }}
                                  >
                                    <User size={48} className="text-white/50" />
                                  </motion.div>
                                </div>
                              )}
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)] via-[var(--color-midnight)]/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />

                            <div className="absolute inset-0 flex flex-col justify-end p-5">
                              <motion.div className="translate-y-2 transform transition-transform duration-300 group-hover:translate-y-0">
                                {submission.word && (
                                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gold)] px-3 py-1.5 text-sm font-bold text-[var(--color-midnight)] shadow-lg">
                                    <Quote size={12} />
                                    {submission.word}
                                  </div>
                                )}
                                {submission.isAnonymous ? (
                                  <div className="flex items-center gap-2 text-lg font-bold text-[var(--color-sand)]">
                                    <EyeOff
                                      size={18}
                                      className="text-[var(--color-sand)]/70"
                                    />
                                    <span>مجهول</span>
                                  </div>
                                ) : submission.userId ? (
                                  <Link href={`/profile/${submission.userId}`}>
                                    <p className="truncate text-lg font-bold text-[var(--color-sand)] transition-colors hover:text-[var(--color-gold)]">
                                      {submission.name}
                                    </p>
                                  </Link>
                                ) : (
                                  <p className="truncate text-lg font-bold text-[var(--color-sand)]">
                                    {submission.name}
                                  </p>
                                )}
                                {submission.semester && (
                                  <div className="mt-2 flex items-center gap-1 text-xs text-[var(--color-sand)]/70">
                                    <Calendar size={12} />
                                    {SEMESTER_LABELS[submission.semester]}
                                  </div>
                                )}
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-20 text-center"
            >
              <div className="elegant-card inline-flex items-center gap-3 rounded-full px-6 py-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-gold)]" />
                <span className="font-medium text-[var(--color-midnight)]/70">
                  {filteredSubmissions.length} ذكرى محفوظة
                </span>
                {filterState.type !== "all" && (
                  <>
                    <span className="text-[var(--color-midnight)]/30">·</span>
                    <span className="text-[var(--color-midnight)]/50">
                      من أصل {submissions.length}
                    </span>
                  </>
                )}
                <div className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
              </div>
            </motion.div>
          </>
        )}
      </main>

      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-midnight)]/80 p-4 backdrop-blur-sm"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-[var(--color-paper)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-midnight)]/10 p-6">
                <h3
                  className="text-xl font-bold text-[var(--color-midnight)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  تصفية حسب الفصل
                </h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-midnight)]/10 text-[var(--color-midnight)] transition-colors hover:bg-[var(--color-midnight)]/20"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 p-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTempFilter({ type: "all" })}
                  className={`w-full rounded-2xl px-6 py-4 text-right font-bold transition-colors ${
                    tempFilter.type === "all"
                      ? "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-copper)] text-white"
                      : "bg-[var(--color-midnight)]/5 text-[var(--color-midnight)] hover:bg-[var(--color-midnight)]/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>الكل</span>
                    {tempFilter.type === "all" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </motion.button>

                {[1, 2, 3].map((year) => (
                  <div key={year} className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTempFilter({ type: "year", year })}
                      className={`w-full rounded-2xl px-6 py-3 text-right font-medium transition-colors ${
                        tempFilter.type === "year" && tempFilter.year === year
                          ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)]"
                          : "text-[var(--color-midnight)]/70 hover:bg-[var(--color-midnight)]/5"
                      }`}
                    >
                      {YEAR_LABELS[year]}
                    </motion.button>
                    <div className="mr-6 grid grid-cols-2 gap-2">
                      {YEAR_SEMESTERS[year]?.map((semester) => (
                        <motion.button
                          key={semester}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setTempFilter({ type: "semester", semester })
                          }
                          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                            tempFilter.type === "semester" &&
                            tempFilter.semester === semester
                              ? "bg-[var(--color-gold)] text-white"
                              : "bg-[var(--color-midnight)]/5 text-[var(--color-midnight)]/60 hover:bg-[var(--color-midnight)]/10"
                          }`}
                        >
                          {SEMESTER_LABELS[semester]}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 border-t border-[var(--color-midnight)]/10 p-6">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 rounded-2xl bg-[var(--color-midnight)]/10 px-6 py-3 font-bold text-[var(--color-midnight)] transition-colors hover:bg-[var(--color-midnight)]/20"
                >
                  إلغاء
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setFilterState(tempFilter);
                    setShowFilterModal(false);
                  }}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-copper)] px-6 py-3 font-bold text-white shadow-[var(--color-gold)]/30 shadow-lg"
                >
                  تطبيق
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-midnight)]/95 p-6 backdrop-blur-xl ${
              isFullscreen ? "!p-0" : ""
            }`}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              layoutId={`card-${selectedCard.id}`}
              onClick={(e) => e.stopPropagation()}
              className={`relative overflow-hidden rounded-[2.5rem] bg-[var(--color-paper)] shadow-2xl ${
                isFullscreen ? "h-full w-full !rounded-none" : "w-full max-w-md"
              }`}
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-6 left-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-sand)] transition-colors hover:bg-red-500"
              >
                <X size={20} />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="absolute top-6 right-20 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-sand)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-midnight)]"
              >
                {isFullscreen ? (
                  <Minimize2 size={20} />
                ) : (
                  <Maximize2 size={20} />
                )}
              </button>

              <div
                className={`relative ${isFullscreen ? "h-full" : "aspect-square"}`}
              >
                {selectedCard.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.name}
                    className={`h-full w-full object-cover ${
                      isFullscreen ? "object-contain" : ""
                    }`}
                  />
                ) : (
                  <div
                    className={`h-full w-full bg-gradient-to-br ${
                      warmGradients[
                        hashUUID(selectedCard.id) % warmGradients.length
                      ]
                    } flex items-center justify-center`}
                  >
                    <User size={96} className="text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-paper)] via-transparent to-transparent" />
              </div>

              <div className="relative -mt-16 p-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  {selectedCard.word && (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-copper)] px-5 py-2.5 shadow-lg">
                      <Quote size={16} className="text-white" />
                      <span className="text-xl font-black text-white">
                        {selectedCard.word}
                      </span>
                    </div>
                  )}

                  {selectedCard.isAnonymous ? (
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-[var(--color-midnight)]">
                      <EyeOff
                        size={24}
                        className="text-[var(--color-midnight)]/50"
                      />
                      <span>مجهول</span>
                    </div>
                  ) : selectedCard.userId ? (
                    <Link href={`/profile/${selectedCard.userId}`}>
                      <h3
                        className="mb-2 cursor-pointer text-2xl font-bold text-[var(--color-midnight)] transition-colors hover:text-[var(--color-gold)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {selectedCard.name}
                      </h3>
                    </Link>
                  ) : (
                    <h3
                      className="mb-2 text-2xl font-bold text-[var(--color-midnight)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {selectedCard.name}
                    </h3>
                  )}

                  <div className="flex items-center justify-center gap-4 text-sm text-[var(--color-midnight)]/50">
                    <span>
                      {new Date(selectedCard.createdAt).toLocaleDateString(
                        "ar-SD",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                    {selectedCard.semester && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {SEMESTER_LABELS[selectedCard.semester]}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-[var(--color-gold)]">
                    {filteredSubmissions.findIndex(
                      (s) => s.id === selectedCard.id,
                    ) + 1}{" "}
                    / {filteredSubmissions.length}
                  </p>
                </motion.div>
              </div>

              {filteredSubmissions.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox("prev")}
                    className="absolute top-1/2 left-4 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-sand)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-midnight)]"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <button
                    onClick={() => navigateLightbox("next")}
                    className="absolute top-1/2 right-4 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-sand)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-midnight)]"
                  >
                    <ChevronLeft size={24} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 py-10 text-center">
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
