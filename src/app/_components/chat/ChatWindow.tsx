"use client";

import { useSearchParams } from "next/navigation";
import { MessageCircle, Phone, Video, Info, ArrowRight } from "lucide-react";
import { api } from "~/trpc/react";
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

  // Context menu state
  const [contextMenuMessage, setContextMenuMessage] = useState<Message | null>(
    null,
  );
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

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
        refetchInterval: 3000,
      },
    );

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onMutate: async (newMessage) => {
      await utils.chat.getMessages.cancel({ conversationId: conversationId! });

      const previousMessages = utils.chat.getMessages.getData({
        conversationId: conversationId!,
      });

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage.content ?? null,
        createdAt: new Date(),
        updatedAt: null,
        senderId: currentUserId,
        senderName: "أنت",
        senderAvatar: null,
        replyToId: newMessage.replyToId ?? null,
        isForwarded: newMessage.isForwarded ?? false,
        deletedAt: null,
        deletedForUserIds: [],
        media: (newMessage.mediaUrls ?? []).map((m, i) => ({
          id: `temp-media-${i}`,
          mediaUrl: m.url,
          mediaType: m.type,
          createdAt: new Date(),
          order: i,
          messageId: `temp-${Date.now()}`,
        })),
        reactions: [],
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              content: replyingTo.content,
              senderName: replyingTo.senderName,
            }
          : null,
      };

      utils.chat.getMessages.setData(
        { conversationId: conversationId! },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [...old.messages, optimisticMessage],
          };
        },
      );

      setReplyingTo(null);

      return { previousMessages };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMessages) {
        utils.chat.getMessages.setData(
          { conversationId: conversationId! },
          context.previousMessages,
        );
      }
    },
    onSettled: () => {
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

  // Optimistic reaction mutation
  const reactMutation = api.chat.react.useMutation({
    onMutate: async ({ messageId, type }) => {
      // Cancel any outgoing refetches
      await utils.chat.getMessages.cancel({ conversationId: conversationId! });

      // Snapshot previous value
      const previousMessages = utils.chat.getMessages.getData({
        conversationId: conversationId!,
      });

      // Optimistically update
      utils.chat.getMessages.setData(
        { conversationId: conversationId! },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((msg) => {
              if (msg.id !== messageId) return msg;

              const existingReaction = msg.reactions.find(
                (r) => r.userId === currentUserId,
              );

              let newReactions: MessageReaction[];
              if (existingReaction) {
                if (existingReaction.reactionType === type) {
                  // Remove reaction
                  newReactions = msg.reactions.filter(
                    (r) => r.userId !== currentUserId,
                  );
                } else {
                  // Update reaction
                  newReactions = msg.reactions.map((r) =>
                    r.userId === currentUserId
                      ? {
                          ...r,
                          reactionType: type,
                        }
                      : r,
                  ) as MessageReaction[];
                }
              } else {
                // Add new reaction
                newReactions = [
                  ...msg.reactions,
                  {
                    id: `temp-${Date.now()}`,
                    userId: currentUserId,
                    messageId,
                    reactionType: type,
                    createdAt: new Date(),
                  } as MessageReaction,
                ];
              }

              return { ...msg, reactions: newReactions };
            }),
          };
        },
      );

      return { previousMessages };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        utils.chat.getMessages.setData(
          { conversationId: conversationId! },
          context.previousMessages,
        );
      }
    },
    onSettled: () => {
      void utils.chat.getMessages.invalidate({
        conversationId: conversationId!,
      });
    },
  });

  // Optimistic delete for me mutation
  const deleteForMeMutation = api.chat.deleteMessageForMe.useMutation({
    onMutate: async ({ messageId }) => {
      await utils.chat.getMessages.cancel({ conversationId: conversationId! });

      const previousMessages = utils.chat.getMessages.getData({
        conversationId: conversationId!,
      });

      // Optimistically remove the message from the list
      utils.chat.getMessages.setData(
        { conversationId: conversationId! },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.filter((msg) => msg.id !== messageId),
          };
        },
      );

      return { previousMessages };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMessages) {
        utils.chat.getMessages.setData(
          { conversationId: conversationId! },
          context.previousMessages,
        );
      }
    },
    onSettled: () => {
      void utils.chat.getMessages.invalidate({
        conversationId: conversationId!,
      });
    },
  });

  // Optimistic delete for all mutation
  const deleteForAllMutation = api.chat.deleteMessageForAll.useMutation({
    onMutate: async ({ messageId }) => {
      await utils.chat.getMessages.cancel({ conversationId: conversationId! });

      const previousMessages = utils.chat.getMessages.getData({
        conversationId: conversationId!,
      });

      // Optimistically remove the message from the list
      utils.chat.getMessages.setData(
        { conversationId: conversationId! },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.filter((msg) => msg.id !== messageId),
          };
        },
      );

      return { previousMessages };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMessages) {
        utils.chat.getMessages.setData(
          { conversationId: conversationId! },
          context.previousMessages,
        );
      }
    },
    onSettled: () => {
      void utils.chat.getMessages.invalidate({
        conversationId: conversationId!,
      });
    },
  });

  const markAsReadMutation = api.chat.markAsRead.useMutation({
    onSuccess: () => {
      void utils.chat.getConversations.invalidate();
    },
  });

  useEffect(() => {
    if (conversationId && messagesData?.messages.length) {
      markAsReadMutation.mutate({ conversationId });
    }
  }, [conversationId, messagesData?.messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.messages.length, conversationId]);

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

  const handleDeleteForMe = (messageId: string) => {
    deleteForMeMutation.mutate({ messageId });
  };

  const handleDeleteForAll = (messageId: string) => {
    deleteForAllMutation.mutate({ messageId });
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
