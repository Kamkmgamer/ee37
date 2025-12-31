"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Bell,
  Send,
  History,
  AlertTriangle,
  Radio,
  CheckCircle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"announcement" | "alert" | "maintenance">(
    "announcement",
  );

  const {
    data: recentAnnouncements,
    refetch,
    isLoading,
  } = api.admin.announcements.getRecentAnnouncements.useQuery({
    limit: 10,
  });

  const broadcastMutation = api.admin.announcements.broadcast.useMutation({
    onSuccess: async () => {
      setTitle("");
      setMessage("");
      await refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && message.trim()) {
      broadcastMutation.mutate({ title, message, type });
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "alert":
        return <AlertTriangle size={18} className="text-red-500" />;
      case "maintenance":
        return <Info size={18} className="text-orange-500" />;
      default:
        return <Bell size={18} className="text-blue-500" />;
    }
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
            Communications
          </p>
          <h1 className="text-3xl font-light text-[#0a1628] sm:text-4xl">
            Broadcast Center
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Compose Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7"
        >
          <div className="overflow-hidden rounded-2xl border border-[#0a1628]/5 bg-white shadow-sm">
            <div className="border-b border-[#0a1628]/5 bg-[#faf7f0]/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a1628] text-[#D4AF37]">
                  <Radio size={20} />
                </div>
                <h2 className="text-lg font-medium text-[#0a1628]">
                  New Transmission
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-[#0a1628]/60 uppercase">
                    Channel / Type
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) =>
                        setType(
                          e.target.value as
                            | "announcement"
                            | "alert"
                            | "maintenance",
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-[#0a1628]/10 bg-[#faf7f0] px-4 py-3 text-sm text-[#0a1628] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                    >
                      <option value="announcement">General Announcement</option>
                      <option value="alert">System Alert</option>
                      <option value="maintenance">Maintenance Notice</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#0a1628]/40">
                      <span className="text-xs">▼</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-[#0a1628]/60 uppercase">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief headline..."
                    className="w-full rounded-xl border border-[#0a1628]/10 bg-white px-4 py-3 text-sm placeholder:text-[#0a1628]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-[#0a1628]/60 uppercase">
                  Message Content
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to all users..."
                  rows={6}
                  className="w-full resize-none rounded-xl border border-[#0a1628]/10 bg-white px-4 py-3 text-sm placeholder:text-[#0a1628]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={broadcastMutation.isPending}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#0a1628] px-6 py-4 text-sm font-medium text-[#D4AF37] transition-all hover:shadow-lg disabled:opacity-70"
                >
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 transition-transform duration-700 group-hover:translate-x-[100%]" />
                  <Send size={18} />
                  {broadcastMutation.isPending
                    ? "Transmitting..."
                    : "Broadcast Signal"}
                </button>

                <AnimatePresence>
                  {broadcastMutation.isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600"
                    >
                      <CheckCircle size={16} />
                      <span>Transmission successful. Signal received.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5"
        >
          <div className="rounded-2xl border border-[#D4AF37]/10 bg-[#faf7f0] p-6">
            <div className="mb-6 flex items-center gap-3">
              <History className="text-[#0a1628]/40" size={20} />
              <h2 className="text-lg font-medium text-[#0a1628]">Signal Log</h2>
            </div>

            <div className="relative space-y-3">
              {/* Timeline Line */}
              <div className="absolute top-2 bottom-2 left-6 w-px bg-[#0a1628]/10" />

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />
                </div>
              ) : !recentAnnouncements || recentAnnouncements.length === 0 ? (
                <div className="py-12 text-center text-[#0a1628]/40">
                  <p className="text-sm">No recent signals logged</p>
                </div>
              ) : (
                recentAnnouncements.map((announcement, i) => {
                  const metadata = announcement.metadata as {
                    title?: string;
                    message?: string;
                    recipientCount?: number;
                    type?: string;
                  };
                  return (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative flex gap-4 pl-2"
                    >
                      <div className="z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white bg-white shadow-sm">
                        {getTypeIcon(metadata.type ?? "announcement")}
                      </div>
                      <div className="flex-1 rounded-xl border border-[#0a1628]/5 bg-white p-4 shadow-sm transition-all hover:border-[#D4AF37]/30">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-bold tracking-wide text-[#0a1628]/70 uppercase">
                            {metadata.title ?? "Untitled Signal"}
                          </span>
                          <span className="font-mono text-[10px] text-[#0a1628]/40">
                            {new Date(
                              announcement.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-[#0a1628]">
                          {metadata.message}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-[#0a1628]/40">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>
                            REACH: {metadata.recipientCount ?? 0} NODES
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
