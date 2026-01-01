"use client";

import Link from "next/link";
import { Home, User, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import { NotificationsPopover } from "./notifications/NotificationsPopover";
import { motion } from "framer-motion";
import { logoutAction } from "./actions";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backHref?: string;
  showNav?: boolean;
  activeNav?: "feed" | "profile" | "learning" | "gallery" | "people" | "chat";
  isAdmin?: boolean;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
}

export function PageHeader({
  title,
  showBack = false,
  backHref = "/",
  showNav = false,
  activeNav,
  isAdmin = false,
  rightAction,
  leftAction,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-midnight)]/10 bg-[var(--color-paper)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {leftAction && <div className="mr-2">{leftAction}</div>}
          {showBack && (
            <Link
              href={backHref}
              className="group rounded-xl p-2 text-[var(--color-midnight)]/60 transition-colors hover:bg-[var(--color-midnight)]/5"
            >
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <ArrowRight size={20} />
              </motion.div>
            </Link>
          )}
          <h1 className="text-xl font-bold text-[var(--color-midnight)]">
            {title}
          </h1>
        </div>

        {showNav && (
          <nav className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/moderation"
                className="rounded-xl p-2 text-[var(--color-midnight)]/60 transition-colors hover:bg-[var(--color-midnight)]/5"
                title="الإشراف"
              >
                <ShieldCheck size={20} className="text-orange-600" />
              </Link>
            )}
            <Link
              href="/feed"
              className={`rounded-xl p-2 transition-colors ${
                activeNav === "feed"
                  ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                  : "text-[var(--color-midnight)]/60 hover:bg-[var(--color-midnight)]/5"
              }`}
            >
              <Home size={20} />
            </Link>
            <Link
              href="/profile"
              className={`rounded-xl p-2 transition-colors ${
                activeNav === "profile"
                  ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                  : "text-[var(--color-midnight)]/60 hover:bg-[var(--color-midnight)]/5"
              }`}
            >
              <User size={20} />
            </Link>
            <NotificationsPopover />
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-xl p-2 text-[var(--color-midnight)]/60 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <LogOut size={20} />
              </button>
            </form>
          </nav>
        )}

        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
