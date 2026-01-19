/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unused-vars */
"use client";

import { useSearchParams } from "next/navigation";
import { MessageCircle, Phone, Video, Info, ArrowRight } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { MessageContextMenu } from "./MessageContextMenu";
import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ForwardDialog } from "./ForwardDialog";
import type { Message, MessageReaction } from "./types";

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
  const [isSending, setIsSending] = useState(false);

  // Context menu state
  const [contextMenuMessage, setContextMenuMessage] = useState<Message | null>(
    null,
  );
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  // Fetch Conversation Details
  const conversation = useQuery(
    api.chat.getConversation,
    conversationId
      ? { conversationId: conversationId as Id<"conversations"> }
      : "skip",
  );
  const isConvLoading = conversation === undefined;

  // Fetch Messages
  const messagesData = useQuery(
    api.chat.getMessages,
    conversationId
      ? {
          conversationId: conversationId as Id<"conversations">,
          currentUserId: currentUserId as Id<"users">,
          paginationOpts: { numItems: 50, cursor: null },
        }
      : "skip",
  );
  const isMessagesLoading = messagesData === undefined;

  const sendMessageMutation = useMutation(api.chat.sendMessage);
  const editMessageMutation = useMutation(api.chat.editMessage);
  const reactMutation = useMutation(api.chat.react);
  const deleteForMeMutation = useMutation(api.chat.deleteMessageForMe);
  const deleteForAllMutation = useMutation(api.chat.deleteMessageForAll);

  const sortedMessages = (messagesData?.page ?? [])
    .slice()
    .reverse()
    .map((msg: any) => ({
      ...msg,
      id: msg._id,
      senderName: msg.sender?.name ?? "Unknown",
      senderAvatar: msg.sender?.avatarUrl ?? null,
      replyTo: msg.replyTo
        ? {
            id: msg.replyTo._id,
            content: msg.replyTo.content,
            senderName: msg.replyTo.sender?.name ?? "Unknown",
          }
        : null,
      // Map other fields that might differ
    }));

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sortedMessages.length, conversationId]);

  const handleContextMenu = useCallback(
    (message: Message, position: { x: number; y: number }) => {
      setContextMenuMessage(message);
      setContextMenuPosition(position);
      setIsContextMenuOpen(true);
    },
    [],
  );

  const handleCloseContextMenu = useCallback(() => {
    setIsContextMenuOpen(false);
    setContextMenuMessage(null);
  }, []);

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
    (p: any) => p.id !== currentUserId,
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
    setIsSending(true);
    try {
      await sendMessageMutation({
        conversationId: conversationId as Id<"conversations">,
        content,
        media: mediaUrls, // Convex expects { url, type } which matches
        replyToId: replyingTo ? (replyingTo.id as Id<"messages">) : undefined,
        currentUserId: currentUserId as Id<"users">,
        isForwarded: false,
      });
      setReplyingTo(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (content: string) => {
    if (!editingMessage) return;
    await editMessageMutation({
      messageId: editingMessage.id as Id<"messages">,
      content,
    });
    setEditingMessage(null);
  };

  const handleForward = (message: Message) => {
    setForwardingMessage(message);
    setIsForwardDialogOpen(true);
  };

  const handleForwardConfirm = async (targetConversationId: string) => {
    if (!forwardingMessage) return;

    await sendMessageMutation({
      conversationId: targetConversationId as Id<"conversations">,
      content: forwardingMessage.content ?? "",
      media: forwardingMessage.media as any,
      currentUserId: currentUserId as Id<"users">,
      isForwarded: true,
    });

    setIsForwardDialogOpen(false);
    setForwardingMessage(null);
  };

  const handleReact = (messageId: string, type: string) => {
    reactMutation({
      messageId: messageId as Id<"messages">,
      type,
      currentUserId: currentUserId as Id<"users">,
    });
  };

  const handleDeleteForMe = (messageId: string) => {
    deleteForMeMutation({
      messageId: messageId as Id<"messages">,
      currentUserId: currentUserId as Id<"users">,
    });
  };

  const handleDeleteForAll = (messageId: string) => {
    deleteForAllMutation({
      messageId: messageId as Id<"messages">,
      currentUserId: currentUserId as Id<"users">,
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
            {sortedMessages.map((msg: any, index: number) => {
              const previousMsg = sortedMessages[index - 1];
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
                  onContextMenu={handleContextMenu}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Context Menu */}
      <MessageContextMenu
        message={contextMenuMessage}
        isOpen={isContextMenuOpen}
        position={contextMenuPosition}
        isMe={contextMenuMessage?.senderId === currentUserId}
        onClose={handleCloseContextMenu}
        onReply={setReplyingTo}
        onForward={handleForward}
        onEdit={setEditingMessage}
        onReact={handleReact}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForAll={handleDeleteForAll}
      />

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
          isLoading={isSending}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </div>
    </div>
  );
}
