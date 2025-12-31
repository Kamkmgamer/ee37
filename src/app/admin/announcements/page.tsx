"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Bell, Send, History } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"announcement" | "alert" | "maintenance">(
    "announcement",
  );

  const { data: recentAnnouncements, refetch } =
    api.admin.announcements.getRecentAnnouncements.useQuery({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="mt-1 text-gray-500">Broadcast messages to all users</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              New Announcement
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as "announcement" | "alert" | "maintenance",
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="announcement">General Announcement</option>
                <option value="alert">Alert</option>
                <option value="maintenance">Maintenance Notice</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title..."
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#D4AF37] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Announcement message..."
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-[#D4AF37] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={broadcastMutation.isPending}
              className="bg-midnight hover:bg-opacity-90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-colors disabled:opacity-50"
            >
              <Bell size={18} />
              {broadcastMutation.isPending
                ? "Sending..."
                : "Broadcast to All Users"}
            </button>

            {broadcastMutation.isSuccess && (
              <p className="text-center text-sm text-green-600">
                Announcement sent successfully!
              </p>
            )}
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <History className="h-5 w-5 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Announcements
            </h2>
          </div>

          <div className="space-y-4">
            {!recentAnnouncements || recentAnnouncements.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No announcements yet
              </p>
            ) : (
              recentAnnouncements.map((announcement) => {
                const metadata = announcement.metadata as {
                  title?: string;
                  message?: string;
                  recipientCount?: number;
                };
                return (
                  <div
                    key={announcement.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {metadata?.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{metadata?.message}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      Sent to {metadata?.recipientCount ?? 0} users
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
