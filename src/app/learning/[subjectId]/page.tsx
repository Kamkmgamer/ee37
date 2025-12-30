"use client";

import { motion } from "framer-motion";
import {
  ChevronRight,
  FileText,
  Video,
  Link as LinkIcon,
  File,
  Download,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { api } from "~/trpc/react";
import React from "react";

const typeIcons = {
  pdf: FileText,
  video: Video,
  link: LinkIcon,
  other: File,
};

const typeColors = {
  pdf: "text-red-500 bg-red-500/10",
  video: "text-blue-500 bg-blue-500/10",
  link: "text-green-500 bg-green-500/10",
  other: "text-gray-500 bg-gray-500/10",
};

export default function SubjectPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;

  const { data: materials, isLoading: materialsLoading } =
    api.learning.getSubjectMaterials.useQuery({ subjectId });

  // Ideally getSubject should return subject + materials, or we fetch subject separately.
  // For now let's query all subjects and find this one (caching helps), or add a getSubject route.
  // Adding getSubject route is better.

  // Refine this later.
  const { data: subjects } = api.learning.getSubjects.useQuery();
  const subject = subjects?.find((s) => s.id === subjectId);

  if (!subjects && !materialsLoading) return null;
  if (subjects && !subject) notFound();

  return (
    <div className="min-h-screen bg-[var(--color-paper)]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-midnight)]/5 bg-[var(--color-paper)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/learning"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-midnight)]/5 text-[var(--color-midnight)] transition-colors hover:bg-[var(--color-midnight)]/10"
            >
              <ChevronRight size={20} />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-[var(--color-midnight)]">
                {subject ? subject.name : "..."}
              </h1>
              <p className="font-mono text-xs text-[var(--color-midnight)]/50">
                {subject?.code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Actions like Add Material could go here */}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Course Info Card */}
        {subject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] to-[var(--color-ink)] p-8 text-[var(--color-sand)] shadow-2xl"
          >
            <div className="geometric-pattern absolute inset-0 opacity-10" />
            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="mb-2 flex items-center gap-3 opacity-80">
                  <span className="rounded-full border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/20 px-3 py-1 text-xs font-bold text-[var(--color-gold)]">
                    الفصل {subject.semester}
                  </span>
                </div>
                <h2 className="font-display mb-2 text-3xl font-bold">
                  {subject.name}
                </h2>
                <p className="max-w-xl text-lg opacity-70">
                  {subject.description ?? "لا يوجد وصف لهذه المادة"}
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/10">
                <BookOpen size={32} className="text-[var(--color-gold)]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters / Search bar could go here */}

        {/* Materials List */}
        <div className="space-y-4">
          <h3 className="mb-4 px-2 font-bold text-[var(--color-midnight)] opacity-60">
            المحاضرات والمراجع
          </h3>

          {materialsLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-gold)]"></div>
            </div>
          ) : materials && materials.length > 0 ? (
            materials.map((item, i) => {
              const Icon = typeIcons[item.type] || File;
              const colorClass = typeColors[item.type] || typeColors.other;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--color-midnight)]/5 bg-white p-4 transition-all hover:border-[var(--color-gold)]/30 hover:shadow-lg"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[var(--color-midnight)] transition-colors group-hover:text-[var(--color-gold)]">
                        {item.title}
                      </h4>
                      <p className="line-clamp-1 text-sm text-[var(--color-midnight)]/50">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 px-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded bg-[var(--color-midnight)]/5 px-2 py-1 text-xs text-[var(--color-midnight)]/40">
                        {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                      <Download
                        size={20}
                        className="text-[var(--color-gold)]"
                      />
                    </div>
                  </a>
                </motion.div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-[var(--color-midnight)]/5 bg-white py-20 text-center">
              <FileText
                size={48}
                className="mx-auto mb-4 text-[var(--color-midnight)]/10"
              />
              <p className="text-[var(--color-midnight)]/40">
                لا توجد مواد مضافة لهذه المادة بعد
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
