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
} from "lucide-react";

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "resolved" | "dismissed" | "all"
  >("pending");
  const [targetFilter, setTargetFilter] = useState<
    "all" | "post" | "comment" | "user"
  >("all");

  const { data: reportsData, refetch } = api.admin.reports.list.useQuery({
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
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case "user":
        return <User className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTargetLabel = (type: string) => {
    switch (type) {
      case "post":
        return "منشور";
      case "comment":
        return "تعليق";
      case "user":
        return "مستخدم";
      default:
        return type;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "violence":
      case "hate_speech":
        return "bg-red-100 text-red-700";
      case "harassment":
        return "bg-orange-100 text-orange-700";
      case "nudity":
        return "bg-pink-100 text-pink-700";
      case "spam":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "dismissed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "resolved":
        return "تم الحل";
      case "dismissed":
        return "تجاهل";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-gray-500">
            Manage content reports and moderation
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {(["pending", "resolved", "dismissed", "all"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-midnight text-white"
                    : "border bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {status === "all" ? "الكل" : getStatusLabel(status)}
              </button>
            ),
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {(["all", "post", "comment", "user"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTargetFilter(type)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                targetFilter === type
                  ? "bg-[#D4AF37] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type === "all" ? "الكل" : getTargetLabel(type)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {!reportsData?.reports || reportsData.reports.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No reports found
            </h3>
            <p className="mt-2 text-gray-500">
              {statusFilter === "pending"
                ? "All reports have been handled"
                : `No ${statusFilter} reports`}
            </p>
          </div>
        ) : (
          reportsData.reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-gray-100 p-3">
                    {getTargetIcon(report.targetType)}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getReasonColor(report.reason)}`}
                      >
                        {report.reason}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(report.status)}`}
                      >
                        {getStatusLabel(report.status)}
                      </span>
                      <span className="text-xs text-gray-400">
                        #{report.id.slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="mt-2 font-semibold text-gray-900">
                      Report on {getTargetLabel(report.targetType)}
                    </h3>

                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{report.reporterName || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>
                          {format(
                            new Date(report.createdAt),
                            "d MMMM yyyy HH:mm",
                            {
                              locale: ar,
                            },
                          )}
                        </span>
                      </div>
                    </div>

                    {report.details && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                        {report.details}
                      </div>
                    )}

                    {report.resolutionNote && (
                      <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                        <strong>Resolution note:</strong>{" "}
                        {report.resolutionNote}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
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
                        className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
                      >
                        <CheckCircle size={18} />
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
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        Dismiss
                      </button>
                    </>
                  )}
                  <a
                    href={`/admin/reports?id=${report.id}`}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    <Eye size={18} />
                    Details
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
