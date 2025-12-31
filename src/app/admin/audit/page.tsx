"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FileSearch, ShieldCheck, Database } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAuditPage() {
  const [actionFilter, setActionFilter] = useState("");

  const { data: logsData, isLoading } = api.admin.audit.list.useQuery({
    actionType: actionFilter || undefined,
    limit: 100,
  });

  const { data: actionTypes } = api.admin.audit.getActionTypes.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex flex-col items-center gap-4"
        >
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />
          <p className="animate-pulse font-mono text-xs tracking-widest text-[#D4AF37] uppercase">
            Retrieving Logs...
          </p>
        </motion.div>
      </div>
    );
  }

  const getActionStyle = (action: string) => {
    if (action.includes("ban") || action.includes("delete"))
      return "text-red-600 bg-red-50";
    if (
      action.includes("approve") ||
      action.includes("create") ||
      action.includes("resolve")
    )
      return "text-emerald-600 bg-emerald-50";
    if (
      action.includes("hide") ||
      action.includes("reject") ||
      action.includes("dismiss")
    )
      return "text-orange-600 bg-orange-50";
    return "text-[#0a1628]/60 bg-[#0a1628]/5";
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
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
            System Records
          </p>
          <h1 className="text-3xl font-light text-[#0a1628] sm:text-4xl">
            Audit Trail
          </h1>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#0a1628]/10 bg-white p-2 shadow-sm">
          <Database size={16} className="ml-2 text-[#0a1628]/40" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-[#0a1628] outline-none"
          >
            <option value="">All Operations</option>
            {actionTypes?.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="overflow-hidden rounded-2xl border border-[#0a1628]/10 bg-white shadow-sm"
      >
        <div className="border-b border-[#0a1628]/5 bg-[#0a1628]/5 px-6 py-3">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#0a1628]/40 uppercase">
            <FileSearch size={14} />
            <span>Transaction Log</span>
          </div>
        </div>

        <div className="divide-y divide-[#0a1628]/5">
          {!logsData?.logs || logsData.logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShieldCheck className="mb-4 h-12 w-12 text-[#D4AF37]/20" />
              <h3 className="text-lg font-medium text-[#0a1628]">Log Empty</h3>
              <p className="text-[#0a1628]/50">
                No administrative actions recorded yet.
              </p>
            </div>
          ) : (
            logsData.logs.map((log) => (
              <motion.div
                key={log.id}
                variants={item}
                className="group flex flex-col gap-4 p-6 transition-colors hover:bg-[#faf7f0]/50 sm:flex-row sm:items-start"
              >
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a1628]/5 font-mono text-xs font-bold text-[#0a1628]/60">
                  {log.actorName ? log.actorName.charAt(0).toUpperCase() : "?"}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[#0a1628]">
                      {log.actorName ?? "Unknown Actor"}
                    </span>
                    <span className="text-xs text-[#0a1628]/40">performed</span>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${getActionStyle(log.actionType)}`}
                    >
                      {log.actionType.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#0a1628]/60">
                    <span>Target:</span>
                    <span className="font-mono text-[#0a1628]">
                      {log.targetType}
                    </span>
                    <span className="font-mono text-xs text-[#0a1628]/40">
                      #{log.targetId.slice(0, 8)}
                    </span>
                  </div>

                  {log.reason && (
                    <div className="mt-2 rounded border-l-2 border-[#D4AF37] bg-[#faf7f0] px-3 py-2 text-sm text-[#0a1628]/80 italic">
                      {log.reason}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 text-xs text-[#0a1628]/40">
                  <span className="font-mono">
                    {format(new Date(log.createdAt), "HH:mm:ss", {
                      locale: ar,
                    })}
                  </span>
                  <span>
                    {format(new Date(log.createdAt), "d MMM yyyy", {
                      locale: ar,
                    })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
