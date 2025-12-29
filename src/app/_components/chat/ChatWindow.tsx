"use client";

import { useSearchParams } from "next/navigation";
import { MessageCircle, Phone, Video, Info, ArrowRight } from "lucide-react";
import { api } from "~/trpc/react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ForwardDialog } from "./ForwardDialog";
import { useState } from "react";
import type { Message } from "./types";

interface ChatWindowProps {
  currentUserId: string;
}

export function ChatWindow({ currentUserId }: ChatWindowProps) {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(
    null,
  );
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false);

  const utils = api.useUtils();

  // Fetch Conversation Details
  const { data: conversation, isLoading: isConvLoading } =
    api.chat.getConversation.useQuery(
      { conversationId: conversationId! },
      { enabled: !!conversationId },
    );

  // Fetch Messages with Polling
  const { data: messagesData, isLoading: isMessagesLoading } =
    api.chat.getMessages.useQuery(
      { conversationId: conversationId! },
      {
        enabled: !!conversationId,
        refetchInterval: 3000, // Poll every 3 seconds
      },
    );

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      setReplyingTo(null);
      void utils.chat.getMessages.invalidate({
        conversationId: conversationId!,
      });
      void utils.chat.getConversations.invalidate();
    },
  });

  const editMessageMutation = api.chat.editMessage.useMutation({
    onSuccess: () => {
      setEditingMessage(null);
      void utils.chat.getMessages.invalidate({
        conversationId: conversationId!,
      });
    },
  });

  const reactMutation = api.chat.react.useMutation({
    onSuccess: () => {
      void utils.chat.getMessages.invalidate({
        conversationId: conversationId!,
      });
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.messages.length, conversationId]);

  if (!conversationId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-[#A0A0A0]">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
          <MessageCircle size={40} className="text-[#D4AF37]" />
        </div>
        <h3 className="text-lg font-bold text-[#EAEAEA]">اختر محادثة للبدء</h3>
        <p className="text-sm">تواصل مع زملائك في الدفعة</p>
      </div>
    );
  }

  if (isConvLoading || !conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId,
  );
  const displayName =
    conversation.type === "group" ? conversation.name : otherParticipant?.name;
  const displayAvatar =
    conversation.type === "group"
      ? conversation.avatarUrl
      : otherParticipant?.avatarUrl;

  const handleSendMessage = async (
    content: string,
    mediaUrls: { url: string; type: "image" | "video" }[],
  ) => {
    await sendMessageMutation.mutateAsync({
      conversationId,
      content,
      mediaUrls,
      replyToId: replyingTo?.id,
    });
  };

  const handleEditMessage = async (content: string) => {
    if (!editingMessage) return;
    await editMessageMutation.mutateAsync({
      messageId: editingMessage.id,
      content,
    });
  };

  const handleForward = (message: Message) => {
    setForwardingMessage(message);
    setIsForwardDialogOpen(true);
  };

  const handleForwardConfirm = async (targetConversationId: string) => {
    if (!forwardingMessage) return;

    await sendMessageMutation.mutateAsync({
      conversationId: targetConversationId,
      content: forwardingMessage.content ?? "",
      mediaUrls: forwardingMessage.media.map((m) => ({
        url: m.mediaUrl,
        type: m.mediaType,
      })),
      isForwarded: true,
    });

    setIsForwardDialogOpen(false);
    setForwardingMessage(null);
    alert("تم توجيه الرسالة بنجاح");
  };

  const handleReact = (messageId: string, type: string) => {
    reactMutation.mutate({
      messageId,
      type: type as
        | "like"
        | "dislike"
        | "heart"
        | "angry"
        | "laugh"
        | "wow"
        | "sad",
    });
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 bg-white/5 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/chat" className="text-[#A0A0A0] md:hidden">
            <ArrowRight size={24} />
          </Link>
          {conversation.type === "private" && otherParticipant ? (
            <Link
              href={`/profile/${otherParticipant.id}`}
              className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-[#1A1A1A]"
            >
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt={displayName ?? ""}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#D4AF37]/20">
                  <span className="font-bold text-[#D4AF37]">
                    {displayName?.charAt(0)}
                  </span>
                </div>
              )}
            </Link>
          ) : (
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-[#1A1A1A]">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt={displayName ?? ""}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#D4AF37]/20">
                  <span className="font-bold text-[#D4AF37]">
                    {displayName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          )}
          <div>
            <h3 className="font-bold text-[#EAEAEA]">{displayName}</h3>
            {conversation.type === "group" && (
              <p className="text-xs text-[#A0A0A0]">
                {conversation.participants.length} عضو
              </p>
            )}
            {conversation.type === "private" && (
              <div className="flex items-center gap-1 text-xs text-[#D4AF37]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" /> متصل
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#D4AF37]">
          <button className="rounded-full p-2 transition-colors hover:bg-white/10">
            <Phone size={20} />
          </button>
          <button className="rounded-full p-2 transition-colors hover:bg-white/10">
            <Video size={20} />
          </button>
          <button className="rounded-full p-2 text-[#A0A0A0] transition-colors hover:bg-white/10">
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1 overflow-y-auto p-4">
        {isMessagesLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col">
            {messagesData?.messages.map((msg, index) => {
              const previousMsg = messagesData.messages[index - 1];
              const isSameSender = previousMsg?.senderId === msg.senderId;
              const showSenderName =
                conversation.type === "group" &&
                (!previousMsg || !isSameSender);
              const spacingClass =
                index === 0 ? "mt-0" : isSameSender ? "mt-1" : "mt-4";

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={msg.senderId === currentUserId}
                  showSenderName={showSenderName}
                  className={spacingClass}
                  onReply={setReplyingTo}
                  onForward={handleForward}
                  onReact={handleReact}
                  onEdit={setEditingMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ForwardDialog
        isOpen={isForwardDialogOpen}
        onClose={() => setIsForwardDialogOpen(false)}
        onForward={handleForwardConfirm}
        currentUserId={currentUserId}
      />

      {/* Input */}
      <div className="border-t border-white/10 bg-[#0F0F0F] p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          isLoading={
            sendMessageMutation.isPending || editMessageMutation.isPending
          }
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </div>
    </div>
  );
}
