"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, X, User, Quote, Zap } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  word: string;
  imageUrl: string | null;
  createdAt: string;
  userId: string | null;
}

// Generate organic transforms for each card
const getCardStyle = (index: number) => {
  const seed = index * 7919;
  const rotation = ((seed % 14) - 7) * 0.7;
  const scale = 1 + (seed % 5) * 0.01;
  return { rotation, scale };
};

// Warm gradient palette for cards without images
const warmGradients = [
  "from-amber-200 via-orange-200 to-rose-200",
  "from-rose-200 via-pink-200 to-violet-200",
  "from-emerald-200 via-teal-200 to-cyan-200",
  "from-violet-200 via-purple-200 to-indigo-200",
  "from-sky-200 via-blue-200 to-indigo-200",
  "from-yellow-200 via-amber-200 to-orange-200",
];

// Hash function to get consistent index from UUID
const hashUUID = (uuid: string): number => {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export default function GalleryPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Submission | null>(null);

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data: Submission[]) => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
          className="bg-gradient-radial absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full from-[var(--color-gold)]/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="bg-gradient-radial absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full from-[var(--color-copper)]/15 to-transparent blur-3xl"
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
            معرض الذكريات
          </span>
        </div>

        <Link href="/survey">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)] text-white shadow-[var(--color-gold)]/30 shadow-lg"
          >
            <Plus size={22} />
          </motion.div>
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 md:px-8">
        {/* Hero */}
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

          {/* Decorative line */}
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
        ) : (
          <>
            {/* Masonry Grid */}
            <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
              {submissions.map((submission, index) => {
                const { rotation } = getCardStyle(index);
                const gradientClass =
                  warmGradients[index % warmGradients.length];

                return (
                  <motion.div
                    key={submission.id}
                    layoutId={`card-${submission.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.06,
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
                    onClick={() => setSelectedCard(submission)}
                    className="group mb-4 cursor-pointer break-inside-avoid"
                  >
                    <div className="elegant-card relative overflow-hidden rounded-3xl">
                      {/* Image/Gradient */}
                      <div
                        className={`aspect-[3/4] ${!submission.imageUrl ? `bg-gradient-to-br ${gradientClass}` : ""}`}
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
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <User size={48} className="text-white/50" />
                            </motion.div>
                          </div>
                        )}
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)] via-[var(--color-midnight)]/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-5">
                        <motion.div className="translate-y-2 transform transition-transform duration-300 group-hover:translate-y-0">
                          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gold)] px-3 py-1.5 text-sm font-bold text-[var(--color-midnight)] shadow-lg">
                            <Quote size={12} />
                            {submission.word}
                          </div>
                          <p className="truncate text-lg font-bold text-[var(--color-sand)]">
                            {submission.name}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Count Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-20 text-center"
            >
              <div className="elegant-card inline-flex items-center gap-3 rounded-full px-6 py-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-gold)]" />
                <span className="font-medium text-[var(--color-midnight)]/70">
                  {submissions.length} ذكرى محفوظة
                </span>
                <div className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
              </div>
            </motion.div>
          </>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-midnight)]/90 p-6 backdrop-blur-xl"
          >
            <motion.div
              layoutId={`card-${selectedCard.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-[var(--color-paper)] shadow-2xl"
            >
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setSelectedCard(null)}
                className="absolute top-6 left-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-midnight)] text-[var(--color-sand)] shadow-lg transition-colors hover:bg-red-500"
              >
                <X size={20} />
              </motion.button>

              {/* Image */}
              <div className="relative aspect-square">
                {selectedCard.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className={`h-full w-full bg-gradient-to-br ${warmGradients[hashUUID(selectedCard.id) % warmGradients.length]} flex items-center justify-center`}
                  >
                    <User size={96} className="text-white/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-paper)] via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="relative -mt-16 p-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-copper)] px-5 py-2.5 shadow-lg">
                    <Quote size={16} className="text-white" />
                    <span className="text-xl font-black text-white">
                      {selectedCard.word}
                    </span>
                  </div>
                  {selectedCard.userId ? (
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
                  <p className="text-sm text-[var(--color-midnight)]/40">
                    {new Date(selectedCard.createdAt).toLocaleDateString(
                      "ar-SD",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </motion.div>
              </div>
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
