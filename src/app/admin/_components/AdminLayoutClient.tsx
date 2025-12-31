"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Flag,
  Users,
  FileText,
  GraduationCap,
  History,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Reports", href: "/admin/reports", icon: Flag },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Learning", href: "/admin/learning", icon: GraduationCap },
  { name: "Audit Log", href: "/admin/audit", icon: History },
  { name: "Announcements", href: "/admin/announcements", icon: Bell },
];

export function AdminLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; isAdmin: boolean };
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#faf7f0]" dir="rtl">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={{ x: 64, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          className={cn(
            "bg-midnight geometric-pattern fixed inset-y-0 right-0 z-30 flex flex-col text-white shadow-xl transition-all duration-300 lg:static",
            isCollapsed ? "w-20" : "w-64",
            isSidebarOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold"
              >
                EE37 Admin
              </motion.h1>
            )}
            {isCollapsed && <span className="mx-auto font-bold">EE37</span>}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="mt-6 flex-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative mb-1 flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:text-white",
                    isActive
                      ? "text-white"
                      : "text-gray-300 hover:bg-gray-800/50",
                    isCollapsed ? "justify-center px-2" : "",
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 rounded-lg bg-gray-800"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <item.icon size={20} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden h-10 w-full items-center justify-center border-t border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white lg:flex"
          >
            {isCollapsed ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>

          <div
            className={cn(
              "border-t border-gray-700 p-4",
              isCollapsed ? "flex justify-center" : "",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]">
                <span className="text-midnight font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-gray-400">Admin</p>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="flex h-16 items-center border-b bg-white px-4 shadow-sm lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            <span className="mr-4 text-lg font-semibold">EE37 Admin</span>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
