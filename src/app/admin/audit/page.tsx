"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Search, History, User } from "lucide-react";

export default function AdminAuditPage() {
  const [actionFilter, setActionFilter] = useState("");

  const { data: logsData, isLoading } = api.admin.audit.list.useQuery({
    actionType: actionFilter || undefined,
    limit: 100,
  });

  const { data: actionTypes } = api.admin.audit.getActionTypes.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  const getActionColor = (action: string) => {
    if (action.includes("ban") || action.includes("delete"))
      return "text-red-600 bg-red-50";
    if (action.includes("approve") || action.includes("create"))
      return "text-green-600 bg-green-50";
    if (action.includes("hide") || action.includes("reject"))
      return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="mt-1 text-gray-500">Track all admin actions</p>
      </div>

      <div className="flex gap-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#D4AF37] focus:outline-none"
        >
          <option value="">All Actions</option>
          {actionTypes?.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {!logsData?.logs || logsData.logs.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <History className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No audit logs found
            </h3>
          </div>
        ) : (
          logsData.logs.map((log) => (
            <div key={log.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-gray-100 p-2">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {log.actorName || "Unknown"}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${getActionColor(log.actionType)}`}
                      >
                        {log.actionType}
                      </span>
                      <span className="text-sm text-gray-500">
                        on {log.targetType} #{log.targetId.slice(0, 8)}
                      </span>
                    </div>
                    {log.reason && (
                      <p className="mt-1 text-sm text-gray-600">{log.reason}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      {format(new Date(log.createdAt), "d MMMM yyyy HH:mm:ss", {
                        locale: ar,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
