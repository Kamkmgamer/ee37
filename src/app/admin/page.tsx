"use client";

import { api } from "~/trpc/react";
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  Ban,
  ArrowUp,
  Bell,
  Shield,
  Search,
} from "lucide-react";
import { motion, useSpring, useTransform, type Variants } from "framer-motion";
import { useEffect } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 40, damping: 20 }); 
  const display = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString(),
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = api.admin.dashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex flex-col items-center gap-4"
        >
          <div className="h-16 w-16 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />
          <p className="animate-pulse text-sm font-medium tracking-widest text-[#D4AF37] uppercase">
            Accessing Archives...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <Shield className="h-16 w-16 text-[#D4AF37]/50" />
        <p className="text-xl font-medium text-[#0a1628]">System Unreachable</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  } as const satisfies Variants;

  const item = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 40, damping: 15 },
    },
  } as const satisfies Variants;

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      trend: stats.newUsers7d,
      trendLabel: "this week",
      icon: Users,
    },
    {
      label: "Total Posts",
      value: stats.totalPosts,
      trend: stats.newPosts24h,
      trendLabel: "today",
      icon: FileText,
    },
    {
      label: "Total Comments",
      value: stats.totalComments,
      icon: MessageSquare,
      trend: stats.newComments24h,
      trendLabel: "today",
    },
  ];

  return (
    <motion.div
      className="space-y-12 p-2 sm:p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header Section */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl bg-[#0a1628] px-8 py-12 text-[#f5ebd7] shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-[#D4AF37] opacity-10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 font-mono text-xs tracking-[0.2em] text-[#D4AF37] uppercase">
              Command Center
            </p>
            <h1 className="text-4xl font-light tracking-tight sm:text-6xl">
              Overview
            </h1>
          </div>
          <div className="mt-6 flex items-center gap-4 border-l border-[#D4AF37]/30 pl-6 sm:mt-0">
            <div>
              <p className="text-xs tracking-wider text-[#D4AF37] uppercase">
                System Status
              </p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-mono text-sm">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-white p-6 shadow-sm transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 translate-y-[-10px] opacity-5 transition-transform group-hover:scale-110">
              <card.icon className="h-full w-full text-[#0a1628]" />
            </div>
            <div>
              <div className="flex items-center gap-3 text-[#0a1628]/60">
                <card.icon size={18} />
                <span className="font-mono text-xs tracking-wider uppercase">
                  {card.label}
                </span>
              </div>
              <div className="mt-4 text-4xl font-light text-[#0a1628]">
                <AnimatedNumber value={card.value} />
              </div>
            </div>
            {card.trend !== undefined && (
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                <ArrowUp size={14} className="stroke-[3]" />
                <span className="font-medium">+{card.trend}</span>
                <span className="ml-1 font-mono text-xs text-[#0a1628]/40 uppercase">
                  {card.trendLabel}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-8">
        {/* Quick Actions - Full width */}
        <motion.div variants={item} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-[#0a1628]">Directives</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Reports Inbox",
                desc: "Review flagged content",
                stat: `${stats.pendingReports}`,
                statLabel: "Pending",
                href: "/admin/reports",
                icon: AlertTriangle,
                urgent: stats.pendingReports > 0,
              },
              {
                title: "User Management",
                desc: "Permissions & Bans",
                stat: `${stats.activeBans}`,
                statLabel: "Active Bans",
                href: "/admin/users",
                icon: Ban,
                urgent: false,
              },
              {
                title: "Broadcast",
                desc: "Sitewide announcements",
                stat: "New",
                statLabel: "Compose",
                href: "/admin/announcements",
                icon: Bell,
                urgent: false,
              },
              {
                title: "Audit Log",
                desc: "System tracing",
                stat: "View",
                statLabel: "History",
                href: "/admin/audit",
                icon: Search,
                urgent: false,
              },
            ].map((action) => (
              <motion.a
                key={action.title}
                href={action.href}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`group relative overflow-hidden rounded-xl border p-6 transition-all ${
                  action.urgent
                    ? "border-red-200 bg-red-50/50 hover:bg-red-50"
                    : "border-[#D4AF37]/20 bg-white hover:border-[#D4AF37]/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-lg p-2 ${
                      action.urgent
                        ? "bg-red-100 text-red-600"
                        : "bg-[#0a1628]/5 text-[#0a1628]"
                    }`}
                  >
                    <action.icon size={20} strokeWidth={2} />
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-light ${
                        action.urgent ? "text-red-600" : "text-[#0a1628]"
                      }`}
                    >
                      {action.stat}
                    </p>
                    <p className="font-mono text-[10px] tracking-wider text-[#0a1628]/40 uppercase">
                      {action.statLabel}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-[#0a1628]">{action.title}</h3>
                  <p className="text-sm text-[#0a1628]/60 group-hover:text-[#0a1628]/80">
                    {action.desc}
                  </p>
                </div>
                {!action.urgent && (
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
                )}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
