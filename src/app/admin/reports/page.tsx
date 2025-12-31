"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  MessageSquare,
  FileText,
  Clock,
  Filter,
  AlertTriangle,
  Shield,
  Inbox,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "resolved" | "dismissed" | "all"
  >("pending");
  const [targetFilter, setTargetFilter] = useState<
    "all" | "post" | "comment" | "user"
  >("all");

  const {
    data: reportsData,
    refetch,
    isLoading,
  } = api.admin.reports.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    targetType: targetFilter === "all" ? undefined : targetFilter,
    limit: 50,
  });

  const resolveMutation = api.admin.reports.resolve.useMutation({
    onSuccess: () => refetch(),
  });

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "post":
        return <FileText className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTargetLabel = (type: string) => {
    switch (type) {
      case "post":
        return "Post content";
      case "comment":
        return "Comment";
      case "user":
        return "User profile";
      default:
        return type;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-2 sm:p-6"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 font-mono text-xs tracking-[0.2em] text-[#D4AF37] uppercase">
            Intelligence
          </p>
          <h1 className="text-3xl font-light text-[#0a1628] sm:text-4xl">
            Reports & Flags
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-[#0a1628]/5 bg-white p-1 shadow-sm">
            {(["pending", "resolved", "dismissed", "all"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    statusFilter === status
                      ? "bg-[#0a1628] text-[#D4AF37] shadow-sm"
                      : "text-[#0a1628]/60 hover:bg-[#faf7f0] hover:text-[#0a1628]"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ),
            )}
          </div>

          <div className="h-6 w-px bg-[#0a1628]/10" />

          <div className="flex items-center gap-1 rounded-lg border border-[#0a1628]/5 bg-white p-1 shadow-sm">
            <Filter className="ml-2 h-3 w-3 text-[#0a1628]/40" />
            {(["all", "post", "comment", "user"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTargetFilter(type)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  targetFilter === type
                    ? "bg-[#D4AF37]/10 text-[#0a1628]"
                    : "text-[#0a1628]/60 hover:bg-[#faf7f0]"
                }`}
              >
                {type === "all"
                  ? "All Types"
                  : getTargetLabel(type).split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />
          </div>
        ) : !reportsData?.reports || reportsData.reports.length === 0 ? (
          <motion.div
            variants={item}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0a1628]/10 py-16 text-center"
          >
            <div className="mb-4 rounded-full bg-[#0a1628]/5 p-4 text-[#0a1628]/40">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-[#0a1628]">All clear</h3>
            <p className="text-[#0a1628]/50">
              No reports found matching your criteria
            </p>
          </motion.div>
        ) : (
          reportsData.reports.map((report) => (
            <motion.div
              key={report.id}
              variants={item}
              className="group relative overflow-hidden rounded-xl border border-[#0a1628]/5 bg-white p-6 shadow-sm transition-all hover:border-[#D4AF37]/30 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${report.targetType === "user" ? "border-orange-200 bg-orange-50 text-orange-600" : report.targetType === "comment" ? "border-purple-200 bg-purple-50 text-purple-600" : "border-blue-200 bg-blue-50 text-blue-600"}`}
                >
                  {getTargetIcon(report.targetType)}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                          report.reason === "violence" ||
                          report.reason === "hate_speech"
                            ? "bg-red-100 text-red-700"
                            : report.reason === "harassment"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-[#0a1628]/5 text-[#0a1628]/70"
                        }`}
                      >
                        {report.reason.replace("_", " ")}
                      </span>
                      <span className="font-mono text-xs text-[#0a1628]/40">
                        ID: {report.id.slice(0, 8)}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-[#0a1628]/40">
                      <Clock size={12} />
                      {format(new Date(report.createdAt), "d MMM yyyy, HH:mm", {
                        locale: ar,
                      })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#0a1628]">
                      Reported {getTargetLabel(report.targetType)}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#0a1628]/60">
                      <span>by</span>
                      <div className="flex items-center gap-1 font-medium text-[#0a1628]">
                        <User size={12} />
                        {report.reporterName ?? "Anonymous"}
                      </div>
                    </div>
                  </div>

                  {report.details && (
                    <div className="rounded-lg bg-[#faf7f0] p-3 text-sm text-[#0a1628]/80 italic">
                      &ldquo;{report.details}&rdquo;
                    </div>
                  )}

                  {report.resolutionNote && (
                    <div className="flex items-start gap-2 rounded-lg bg-blue-50/50 p-3 text-xs text-blue-800">
                      <Shield size={14} className="mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold">Resolution:</span>{" "}
                        {report.resolutionNote}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 self-start pt-2 sm:pt-0">
                  {report.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          resolveMutation.mutate({
                            reportId: report.id,
                            status: "resolved",
                            actionTaken: "resolved",
                          })
                        }
                        disabled={resolveMutation.isPending}
                        className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                      >
                        <CheckCircle size={14} />
                        Resolve
                      </button>
                      <button
                        onClick={() =>
                          resolveMutation.mutate({
                            reportId: report.id,
                            status: "dismissed",
                            actionTaken: "dismissed",
                          })
                        }
                        disabled={resolveMutation.isPending}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Dismiss
                      </button>
                    </>
                  )}
                  <a
                    href={`/admin/reports?id=${report.id}`}
                    className="flex items-center gap-2 rounded-lg border border-[#0a1628]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#0a1628] transition-colors hover:border-[#D4AF37]/50 hover:bg-[#faf7f0]"
                  >
                    <Eye size={14} />
                    Inspect
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
