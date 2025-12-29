"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "./ChatWidget";

interface ChatWidgetWrapperProps {
  userId: string;
}

export function ChatWidgetWrapper({ userId }: ChatWidgetWrapperProps) {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith("/chat");

  if (isChatPage) {
    return null;
  }

  return <ChatWidget userId={userId} />;
}
