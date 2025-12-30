"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Loader2, MessageCircle, Heart } from "lucide-react";
import { api } from "~/trpc/react";
import Link from "next/link";
import NextImage from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import type { RouterOutputs } from "~/trpc/react";

type Notification = RouterOutputs["notifications"]["getAll"][number];

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: unreadCount = 0, refetch: refetchCount } =
    api.notifications.getUnreadCount.useQuery(
      undefined,
      { refetchInterval: 30000 }, // Poll every 30s
    );

  const {
    data: notifications,
    isLoading,
    refetch: refetchList,
  } = api.notifications.getAll.useQuery({ limit: 20 }, { enabled: isOpen });

  // Mutations
  const markAsReadMutation = api.notifications.markAsRead.useMutation({
    onSuccess: () => {
      void refetchCount();
      void refetchList();
    },
  });

  const markAllAsReadMutation = api.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      void refetchCount();
      void refetchList();
    },
  });

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "post_reaction":
      case "comment_reaction":
        return <Heart className="h-4 w-4 text-red-500" fill="currentColor" />;
      case "new_comment":
      case "comment_reply":
        return (
          <MessageCircle
            className="h-4 w-4 text-blue-500"
            fill="currentColor"
          />
        );
      default:
        return <Bell className="text-gold h-4 w-4" />;
    }
  };

  const getText = (notification: Notification) => {
    const actorName = notification.actor.name;
    switch (notification.type) {
      case "post_reaction":
        return (
          <span>
            <span className="font-bold">{actorName}</span> تفاعل مع منشورك
          </span>
        );
      case "comment_reaction":
        return (
          <span>
            <span className="font-bold">{actorName}</span> تفاعل مع تعليقك
          </span>
        );
      case "new_comment":
        return (
          <span>
            <span className="font-bold">{actorName}</span> علق على منشورك
          </span>
        );
      case "comment_reply":
        return (
          <span>
            <span className="font-bold">{actorName}</span> رد على تعليقك
          </span>
        );
      default:
        return "إشعار جديد";
    }
  };

  const getLink = (notification: Notification) => {
    // Assuming feed supports anchor links or we just go to feed.
    // Ideally /feed?postId=...
    return `/feed#post-${notification.postId ?? ""}`;
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-midnight/60 hover:bg-midnight/5 hover:text-midnight relative rounded-xl p-2 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="border-midnight/10 absolute left-0 z-50 mt-2 w-80 translate-x-[-80%] overflow-hidden rounded-2xl border bg-white shadow-xl ring-1 ring-black/5 md:translate-x-0">
          <div className="border-midnight/5 flex items-center justify-between border-b bg-gray-50/50 p-3">
            <h3 className="text-midnight text-sm font-bold">الإشعارات</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-gold hover:text-gold/80 flex items-center gap-1 text-xs"
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck size={14} />
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="text-midnight/40 flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 p-3 transition-colors hover:bg-gray-50 ${!notification.isRead ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="relative mt-1 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                      {notification.actor.profile?.avatarUrl ? (
                        <NextImage
                          src={notification.actor.profile.avatarUrl}
                          alt={notification.actor.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-gold/20 text-gold flex h-full w-full items-center justify-center text-xs font-bold">
                          {notification.actor.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-midnight/90 text-sm leading-snug">
                        {getText(notification)}
                      </p>
                      <p className="text-midnight/40 mt-1 text-xs">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </p>
                    </div>
                    <div className="mt-1">{getIcon(notification.type)}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-midnight/40 p-8 text-center text-sm">
                لا توجد إشعارات حالياً
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
