"use client";

import { api } from "~/trpc/react";
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  Ban,
  TrendingUp,
  ArrowUp,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = api.admin.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Failed to load stats</p>
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers,
      change: stats.newUsers7d,
      changeLabel: "new in 7 days",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Total Posts",
      value: stats.totalPosts,
      change: stats.newPosts24h,
      changeLabel: "new in 24h",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      name: "Total Comments",
      value: stats.totalComments,
      change: stats.newComments24h,
      changeLabel: "new in 24h",
      icon: MessageSquare,
      color: "bg-purple-500",
    },
    {
      name: "Pending Reports",
      value: stats.pendingReports,
      icon: AlertTriangle,
      color: "bg-red-500",
      alert: stats.pendingReports > 0,
    },
    {
      name: "Active Bans",
      value: stats.activeBans,
      icon: Ban,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">System overview and statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.name}
            className={`rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
              card.alert ? "ring-2 ring-red-500" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-3 ${card.color} bg-opacity-10`}>
                <card.icon
                  className={`h-6 w-6 ${card.color.replace("bg-", "text-")}`}
                />
              </div>
              {card.change !== undefined && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowUp size={16} />
                  <span>{card.change}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900">
                {card.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{card.name}</p>
              {card.changeLabel && (
                <p className="mt-1 text-xs text-gray-400">{card.changeLabel}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="/admin/reports"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="rounded-lg bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Review Reports</p>
                <p className="text-sm text-gray-500">
                  {stats.pendingReports} pending
                </p>
              </div>
            </a>
            <a
              href="/admin/announcements"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="rounded-lg bg-blue-100 p-2">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Broadcast</p>
                <p className="text-sm text-gray-500">Send announcement</p>
              </div>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="rounded-lg bg-orange-100 p-2">
                <Ban className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">
                  {stats.activeBans} banned
                </p>
              </div>
            </a>
            <a
              href="/admin/audit"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="rounded-lg bg-gray-100 p-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Audit Log</p>
                <p className="text-sm text-gray-500">Track all actions</p>
              </div>
            </a>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            System Info
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-gray-500">Total Users</span>
              <span className="font-semibold">
                {stats.totalUsers.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-gray-500">New Users (7d)</span>
              <span className="font-semibold text-green-600">
                +{stats.newUsers7d}
              </span>
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-gray-500">Total Posts</span>
              <span className="font-semibold">
                {stats.totalPosts.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-b py-2">
              <span className="text-gray-500">New Posts (24h)</span>
              <span className="font-semibold text-green-600">
                +{stats.newPosts24h}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500">Active Bans</span>
              <span className="font-semibold text-red-600">
                {stats.activeBans}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
