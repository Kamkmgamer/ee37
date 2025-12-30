"use client";

import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ModerationPage() {
  const {
    data: reports,
    refetch,
    isLoading,
  } = api.reports.getPending.useQuery();
  const updateStatus = api.reports.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const [filter, setFilter] = useState<"all" | "post" | "comment" | "user">(
    "all",
  );

  const filteredReports = reports?.filter(
    (r) => filter === "all" || r.targetType === filter,
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                غرفة العمليات (إشراف)
              </h1>
              <p className="mt-1 text-gray-500">
                إدارة البلاغات والمحتوى المخالف
              </p>
            </div>
            <div className="flex gap-2">
              {(["all", "post", "comment", "user"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                    filter === t
                      ? "bg-midnight text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t === "all"
                    ? "الكل"
                    : t === "post"
                      ? "منشورات"
                      : t === "comment"
                        ? "تعليقات"
                        : "مستخدمين"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {!filteredReports || filteredReports.length === 0 ? (
          <div className="rounded-3xl bg-white p-20 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">الساحة نظيفة!</h2>
            <p className="mt-2 text-gray-500">
              لا توجد بلاغات معلقة في الوقت الحالي.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-1 rounded-2xl p-3 ${
                        report.targetType === "post"
                          ? "bg-blue-50 text-blue-600"
                          : report.targetType === "comment"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {report.targetType === "post" ? (
                        <FileText size={24} />
                      ) : report.targetType === "comment" ? (
                        <MessageSquare size={24} />
                      ) : (
                        <User size={24} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400">
                          #{report.id.slice(0, 8)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            report.reason === "violence" ||
                            report.reason === "hate_speech"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {report.reason}
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">
                        بلاغ عن{" "}
                        {report.targetType === "post"
                          ? "منشور"
                          : report.targetType === "comment"
                            ? "تعليق"
                            : "مستخدم"}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>المبلغ: {report.reporter?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>
                            {format(
                              new Date(report.createdAt),
                              "d MMMM yyyy HH:mm",
                              { locale: ar },
                            )}
                          </span>
                        </div>
                      </div>

                      {report.details && (
                        <div className="mt-4 rounded-2xl bg-gray-50 p-4 font-medium text-gray-700">
                          {report.details}
                        </div>
                      )}

                      <div className="mt-4 flex gap-4">
                        <Link
                          href={
                            report.targetType === "user"
                              ? `/profile/${report.targetId}`
                              : report.targetType === "post"
                                ? `/feed?post=${report.targetId}` // Assuming view single post logic
                                : `/feed?comment=${report.targetId}`
                          }
                          className="flex items-center gap-1 text-sm font-bold text-[#D4AF37] hover:underline"
                        >
                          <ExternalLink size={14} />
                          معاينة الهدف
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        updateStatus.mutate({
                          reportId: report.id,
                          status: "resolved",
                        })
                      }
                      disabled={updateStatus.isPending}
                      className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      تم الحل
                    </button>
                    <button
                      onClick={() =>
                        updateStatus.mutate({
                          reportId: report.id,
                          status: "dismissed",
                        })
                      }
                      disabled={updateStatus.isPending}
                      className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      تجاهل
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
