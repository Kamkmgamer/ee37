"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  EyeOff,
  User,
  Calendar,
  Image as ImageIcon,
  AlertTriangle,
  Ban,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SubmissionWithUser {
  id: string;
  name: string;
  word: string;
  imageUrl: string | null;
  createdAt: string;
  isAnonymous: boolean;
  userId: string | null;
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    collegeId: string | null;
  } | null;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithUser | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((res) => res.json())
      .then((data: SubmissionWithUser[]) => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sub.name.toLowerCase().includes(searchLower) ||
      sub.word.toLowerCase().includes(searchLower) ||
      (sub.user?.name?.toLowerCase().includes(searchLower) ?? false) ||
      (sub.user?.email?.toLowerCase().includes(searchLower) ?? false) ||
      (sub.user?.collegeId?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const groupedByUser = filteredSubmissions.reduce(
    (acc, sub) => {
      const userKey = sub.user?.id ?? "anonymous";
      acc[userKey] ??= {
        user: sub.user,
        submissions: [],
        isAnonymous: !sub.user,
      };
      acc[userKey].submissions.push(sub);
      return acc;
    },
    {} as Record<
      string,
      {
        user: SubmissionWithUser["user"];
        submissions: SubmissionWithUser[];
        isAnonymous: boolean;
      }
    >,
  );

  const toggleExpanded = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)]" dir="rtl">
      <header className="border-b border-[var(--color-midnight)]/5 bg-white/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-midnight)]">
              مراقبة المشاركات
            </h1>
            <p className="text-sm text-[var(--color-midnight)]/50">
              عرض جميع المشاركات مع معلومات المستخدمين
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--color-midnight)]/30"
                size={20}
              />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-xl border border-[var(--color-midnight)]/10 bg-[var(--color-midnight)]/5 px-10 py-2 text-sm focus:border-[var(--color-gold)] focus:outline-none"
              />
            </div>
            <div className="rounded-xl bg-[var(--color-midnight)]/5 px-4 py-2 text-sm font-medium text-[var(--color-midnight)]">
              {submissions.length} مشاركة
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="h-16 w-16 rounded-full border-4 border-[var(--color-gold)]/20 border-t-[var(--color-gold)]"
            />
            <p className="text-[var(--color-midnight)]/40">جاري التحميل...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[3rem] bg-[var(--color-midnight)]/5">
              <User size={64} className="text-[var(--color-midnight)]/20" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-[var(--color-midnight)]/40">
              لا توجد مشاركات
            </h2>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByUser).map(
              ([
                userId,
                { user, submissions: userSubmissions, isAnonymous },
              ]) => {
                const isExpanded = expandedUsers.has(userId);
                const submissionCount = userSubmissions.length;
                const latestSubmission = userSubmissions[0];
                const hasProblematicContent = userSubmissions.some(
                  (s) => s.word.length > 15 || /[0-9]{5,}/.test(s.word),
                );

                return (
                  <motion.div
                    key={userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-2xl border border-[var(--color-midnight)]/10 bg-white shadow-sm"
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-[var(--color-midnight)]/5"
                      onClick={() => toggleExpanded(userId)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-gold)]/10">
                          <User
                            size={24}
                            className="text-[var(--color-gold)]"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[var(--color-midnight)]">
                              {isAnonymous
                                ? "مجهول"
                                : (user?.name ?? "مستخدم محذوف")}
                            </h3>
                            {isAnonymous && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                إخفاء ذاتي
                              </span>
                            )}
                            {hasProblematicContent && (
                              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                <AlertTriangle size={12} />
                                يحتاج مراجعة
                              </span>
                            )}
                          </div>
                          {!isAnonymous && user && (
                            <p className="text-sm text-[var(--color-midnight)]/50">
                              {user.email} • {user.collegeId}
                            </p>
                          )}
                          {isAnonymous && latestSubmission && (
                            <p className="text-sm text-[var(--color-midnight)]/50">
                              IP مرتبط بالمستخدم •{" "}
                              {new Date(
                                latestSubmission.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="text-2xl font-bold text-[var(--color-gold)]">
                            {submissionCount}
                          </p>
                          <p className="text-xs text-[var(--color-midnight)]/40">
                            {submissionCount === 1 ? "مشاركة" : "مشاركات"}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="text-[var(--color-midnight)]/30" />
                        ) : (
                          <ChevronDown className="text-[var(--color-midnight)]/30" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-[var(--color-midnight)]/10"
                        >
                          <div className="p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h4 className="font-medium text-[var(--color-midnight)]/70">
                                المشاركات
                              </h4>
                              {!isAnonymous && user && (
                                <div className="flex gap-2">
                                  <Link
                                    href={`/profile/${user.id}`}
                                    className="flex items-center gap-1 rounded-lg bg-[var(--color-midnight)]/5 px-3 py-1.5 text-sm font-medium text-[var(--color-midnight)] transition-colors hover:bg-[var(--color-midnight)]/10"
                                  >
                                    <Eye size={14} />
                                    عرض الملف
                                  </Link>
                                  <button className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
                                    <Ban size={14} />
                                    حظر
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              {userSubmissions.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex cursor-pointer items-center gap-4 rounded-xl bg-[var(--color-midnight)]/5 p-3 transition-colors hover:bg-[var(--color-midnight)]/10"
                                  onClick={() => setSelectedSubmission(sub)}
                                >
                                  {sub.imageUrl ? (
                                    <Image
                                      src={sub.imageUrl}
                                      alt=""
                                      className="h-12 w-12 rounded-lg object-cover"
                                      width={48}
                                      height={48}
                                    />
                                  ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-midnight)]/10">
                                      <ImageIcon
                                        size={20}
                                        className="text-[var(--color-midnight)]/30"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="font-bold text-[var(--color-midnight)]">
                                      {sub.word}
                                    </p>
                                    <p className="text-sm text-[var(--color-midnight)]/50">
                                      {sub.isAnonymous ? "مجهول" : sub.name}
                                      {!sub.isAnonymous && sub.userId && (
                                        <span className="mr-2 text-xs text-[var(--color-midnight)]/30">
                                          ({sub.userId.slice(0, 8)}...)
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-[var(--color-midnight)]/40">
                                    <Calendar size={14} />
                                    {new Date(sub.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              },
            )}
          </div>
        )}
      </main>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-midnight)]/90 p-6 backdrop-blur-xl"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-midnight)]/10 p-4">
                <h3 className="font-bold text-[var(--color-midnight)]">
                  تفاصيل المشاركة
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-midnight)]/5 text-[var(--color-midnight)] transition-colors hover:bg-red-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6 flex gap-6">
                  {selectedSubmission.imageUrl ? (
                    <Image
                      src={selectedSubmission.imageUrl}
                      alt=""
                      className="h-48 w-48 rounded-2xl object-cover"
                      width={192}
                      height={192}
                    />
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-[var(--color-midnight)]/5">
                      <ImageIcon
                        size={48}
                        className="text-[var(--color-midnight)]/20"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--color-midnight)]/50">
                        الكلمة
                      </label>
                      <p className="text-2xl font-bold text-[var(--color-midnight)]">
                        {selectedSubmission.word}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--color-midnight)]/50">
                        الاسم المعروض
                      </label>
                      <p className="font-medium text-[var(--color-midnight)]">
                        {selectedSubmission.isAnonymous ? (
                          <span className="flex items-center gap-2">
                            <EyeOff size={16} />
                            مجهول
                          </span>
                        ) : (
                          selectedSubmission.name
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--color-midnight)]/50">
                        تاريخ الإرسال
                      </label>
                      <p className="font-medium text-[var(--color-midnight)]">
                        {new Date(
                          selectedSubmission.createdAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                    {selectedSubmission.user && (
                      <div>
                        <label className="text-sm font-medium text-[var(--color-midnight)]/50">
                          المستخدم
                        </label>
                        <p className="font-medium text-[var(--color-midnight)]">
                          {selectedSubmission.user?.name}
                        </p>
                        <p className="text-sm text-[var(--color-midnight)]/50">
                          {selectedSubmission.user?.email}
                        </p>
                        <p className="text-sm text-[var(--color-midnight)]/50">
                          {selectedSubmission.user?.collegeId}
                        </p>
                        <p className="text-xs text-[var(--color-midnight)]/30">
                          ID: {selectedSubmission.user?.id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 rounded-xl bg-[var(--color-midnight)]/5 py-3 font-medium text-[var(--color-midnight)] transition-colors hover:bg-[var(--color-midnight)]/10">
                    إخفاء المشاركة
                  </button>
                  <button className="flex-1 rounded-xl bg-red-50 py-3 font-medium text-red-600 transition-colors hover:bg-red-100">
                    حظر المستخدم
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
