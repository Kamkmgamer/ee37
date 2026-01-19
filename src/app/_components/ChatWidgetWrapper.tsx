"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "./ChatWidget";

interface ChatWidgetWrapperProps {
  user: {
    userId: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    collegeId?: string;
  } | null;
}

export function ChatWidgetWrapper({ user }: ChatWidgetWrapperProps) {
  const userId = user?.userId ?? "";
  const pathname = usePathname();
  const isChatPage =
    pathname?.startsWith("/chat") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/survey");

  if (isChatPage) {
    return null;
  }

  return <ChatWidget userId={userId} user={user} />;
}
