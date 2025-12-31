import { z } from "zod";
import { eq, desc, and, or, sql, inArray, lt } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  conversations,
  conversationParticipants,
  messages,
  messageMedia,
  messageReactions,
  users,
  userProfiles,
} from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { AI_USER_ID } from "~/lib/constants";
import OpenAI from "openai";

export const chatRouter = createTRPCRouter({
  createConversation: protectedProcedure
    .input(
      z.object({
        type: z.enum(["private", "group"]),
        participantIds: z.array(z.string().uuid()).min(1),
        name: z.string().max(256).optional(),
        avatarUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { type, participantIds, name, avatarUrl } = input;
      const currentUserId = ctx.session.user.id;

      if (type === "private") {
        if (participantIds.length !== 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Private chats must have exactly one other participant",
          });
        }

        const otherUserId = participantIds[0];
        if (!otherUserId) throw new TRPCError({ code: "BAD_REQUEST" });

        const userConversations = await ctx.db
          .select({ id: conversationParticipants.conversationId })
          .from(conversationParticipants)
          .innerJoin(
            conversations,
            eq(conversations.id, conversationParticipants.conversationId),
          )
          .where(
            and(
              eq(conversationParticipants.userId, currentUserId),
              eq(conversations.type, "private"),
            ),
          );

        for (const conv of userConversations) {
          const otherParticipant = await ctx.db
            .select()
            .from(conversationParticipants)
            .where(
              and(
                eq(conversationParticipants.conversationId, conv.id),
                eq(conversationParticipants.userId, otherUserId),
              ),
            )
            .limit(1);

          if (otherParticipant.length > 0) {
            return { conversationId: conv.id, isNew: false };
          }
        }
      }

      // Create conversation
      const [newConversation] = await ctx.db
        .insert(conversations)
        .values({
          type,
          name: type === "group" ? name : undefined,
          avatarUrl: type === "group" ? avatarUrl : undefined,
          createdBy: currentUserId,
        })
        .returning();

      if (!newConversation)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Add participants (including creator)
      const allParticipants = [...new Set([...participantIds, currentUserId])];

      await ctx.db.insert(conversationParticipants).values(
        allParticipants.map((userId) => ({
          conversationId: newConversation.id,
          userId,
        })),
      );

      return { conversationId: newConversation.id, isNew: true };
    }),

  // Get user's conversations
  getConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const currentUserId = ctx.session.user.id;

      let conversationIds: string[] = [];
      //TODO: implement cursor pagination
      if (cursor) {

      }

      // Get conversations user is involved in
      // Correct pagination would require joining on conversationParticipants and ordering by conversation.updatedAt
      const userConvs = await ctx.db
        .select({
          conversationId: conversationParticipants.conversationId,
        })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.userId, currentUserId));

      conversationIds = userConvs.map((c) => c.conversationId);

      if (conversationIds.length === 0) {
        return { conversations: [], nextCursor: undefined };
      }

      // Fetch conversation details with latest message
      const convs = await ctx.db
        .select()
        .from(conversations)
        .where(
          and(
            inArray(conversations.id, conversationIds),
            cursor
              ? lt(
                  conversations.updatedAt,
                  sql`(SELECT "updatedAt" FROM ${conversations} WHERE id = ${cursor})`,
                )
              : undefined,
          ),
        )
        .orderBy(desc(conversations.updatedAt))
        .limit(limit + 1);

      const hasNextPage = convs.length > limit;
      const resultConvs = hasNextPage ? convs.slice(0, -1) : convs;
      const nextCursor = hasNextPage
        ? resultConvs[resultConvs.length - 1]?.id
        : undefined;

      const targetConversationIds = resultConvs.map((c) => c.id);

      const [lastMessagesRaw, unreadCountsRaw, allParticipants] =
        await Promise.all([
          // 1. Last Messages (Batch)
          ctx.db.execute(sql`
          SELECT DISTINCT ON (m."conversationId")
            m.id, m."conversationId", m."senderId", m.content, m."createdAt", m."updatedAt", m."replyToId", m."isForwarded"
          FROM ${messages} m
          WHERE m."conversationId" = ANY(${sql.raw(`ARRAY[${targetConversationIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})
          ORDER BY m."conversationId", m."createdAt" DESC
        `),

          // 2. Unread Counts (Batch)
          ctx.db.execute(sql`
          SELECT m."conversationId", COUNT(*)::int as count
          FROM ${messages} m
          JOIN ${conversationParticipants} cp ON m."conversationId" = cp."conversationId"
          WHERE cp."userId" = ${currentUserId}
          AND m."conversationId" = ANY(${sql.raw(`ARRAY[${targetConversationIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})
          AND m."senderId" != ${currentUserId}
          AND m."createdAt" > cp."lastReadAt"
          GROUP BY m."conversationId"
        `),

          // 3. Participants (Batch)
          ctx.db
            .select({
              conversationId: conversationParticipants.conversationId,
              id: users.id,
              name: users.name,
              avatarUrl: userProfiles.avatarUrl,
            })
            .from(conversationParticipants)
            .innerJoin(users, eq(users.id, conversationParticipants.userId))
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(
              inArray(
                conversationParticipants.conversationId,
                targetConversationIds,
              ),
            ),
        ]);

      // Types for raw SQL results
      type RawMessageRow = {
        id: string;
        conversation_id: string;
        sender_id: string;
        content: string | null;
        created_at: Date | string;
        updated_at: Date | string | null;
        reply_to_id: string | null;
        is_forwarded: boolean;
      };

      type RawCountRow = {
        conversation_id: string;
        count: number | string;
      };

      // Process Last Messages
      const lastMessageMap = new Map();
      // Handle potential driver differences (array vs { rows: ... })
      const lastMessagesRows = (
        Array.isArray(lastMessagesRaw)
          ? lastMessagesRaw
          : (lastMessagesRaw as { rows: unknown[] }).rows
      ) as RawMessageRow[];

      lastMessagesRows.forEach((row) => {
        lastMessageMap.set(row.conversation_id, {
          id: row.id,
          conversationId: row.conversation_id,
          senderId: row.sender_id,
          content: row.content,
          createdAt: new Date(row.created_at),
          updatedAt: row.updated_at ? new Date(row.updated_at) : null,
          replyToId: row.reply_to_id,
          isForwarded: row.is_forwarded,
        });
      });

      // Process Unread Counts
      const unreadCountMap = new Map();
      const unreadCountsRows = (
        Array.isArray(unreadCountsRaw)
          ? unreadCountsRaw
          : (unreadCountsRaw as { rows: unknown[] }).rows
      ) as RawCountRow[];

      unreadCountsRows.forEach((row) => {
        unreadCountMap.set(row.conversation_id, Number(row.count));
      });

      // Process Participants
      type ParticipantState = {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
      const participantsMap = new Map<string, ParticipantState[]>();
      allParticipants.forEach((p) => {
        const existing = participantsMap.get(p.conversationId) ?? [];
        existing.push({ id: p.id, name: p.name, avatarUrl: p.avatarUrl });
        participantsMap.set(p.conversationId, existing);
      });

      const results = resultConvs.map((conv) => ({
        ...conv,
        lastMessage:
          (lastMessageMap.get(conv.id) as typeof messages.$inferSelect) ??
          undefined,
        unreadCount: (unreadCountMap.get(conv.id) as number) ?? 0,
        participants: participantsMap.get(conv.id) ?? [],
      }));

      return {
        conversations: results,
        nextCursor,
      };
    }),

  // Get single conversation details
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      // Check participation
      const [participation] = await ctx.db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, currentUserId),
          ),
        );

      if (!participation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a participant",
        });
      }

      const [conversation] = await ctx.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId));

      if (!conversation) throw new TRPCError({ code: "NOT_FOUND" });

      const participants = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          avatarUrl: userProfiles.avatarUrl,
          joinedAt: conversationParticipants.joinedAt,
        })
        .from(conversationParticipants)
        .innerJoin(users, eq(users.id, conversationParticipants.userId))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(
          eq(conversationParticipants.conversationId, input.conversationId),
        );

      return {
        ...conversation,
        participants,
      };
    }),

  // Send a message
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        content: z.string().optional(),
        replyToId: z.string().uuid().optional(),
        isForwarded: z.boolean().default(false),
        mediaUrls: z
          .array(
            z.object({
              url: z.string().url(),
              type: z.enum(["image", "video"]),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { conversationId, content, mediaUrls, replyToId, isForwarded } =
        input;
      const currentUserId = ctx.session.user.id;

      if (!content && (!mediaUrls || mediaUrls.length === 0)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Message cannot be empty",
        });
      }

      // Verify participation
      const [participation] = await ctx.db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, currentUserId),
          ),
        );

      if (!participation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a participant",
        });
      }

      // Create message
      const [newMessage] = await ctx.db
        .insert(messages)
        .values({
          conversationId,
          senderId: currentUserId,
          content,
          replyToId,
          isForwarded,
        })
        .returning();

      if (!newMessage) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Add media
      if (mediaUrls && mediaUrls.length > 0) {
        await ctx.db.insert(messageMedia).values(
          mediaUrls.map((media, index) => ({
            messageId: newMessage.id,
            mediaUrl: media.url,
            mediaType: media.type,
            order: index,
          })),
        );
      }

      // Update conversation timestamp
      await ctx.db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

      // AI Integration
      const conversationParticipantsList = await ctx.db
        .select()
        .from(conversationParticipants)
        .where(eq(conversationParticipants.conversationId, conversationId));

      const isAIConversation = conversationParticipantsList.some(
        (p) => p.userId === AI_USER_ID,
      );

      if (isAIConversation) {
        // Trigger AI response (we await it here to ensure it runs in serverless env)
        // In a production app with queues, this should be offloaded
        try {
          const history = await ctx.db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(desc(messages.createdAt))
            .limit(10); // Context window

          const historyMessages = history.reverse().map((msg) => ({
            role:
              msg.senderId === AI_USER_ID
                ? ("assistant" as const)
                : ("user" as const),
            content: msg.content ?? "",
          }));

          const client = new OpenAI({
            apiKey: process.env.CEREBRAS_API_KEY,
            baseURL: "https://api.cerebras.ai/v1",
          });

          const systemPrompt = `You are "خديجة الرسام", a helpful AI assistant for the "EE37" batch (Electrical Engineering Batch 37).
            - Answer in clear, concise Arabic.
            - Be helpful, friendly, and professional.
            - Your goal is to assist students with their academic and social inquiries.
            - If asked about yourself, say you are the batch's intelligent assistant.`;

          const aiResponse = await client.chat.completions.create({
            model: "gpt-oss-120b",
            // formatted: true, // Specific to Cerebras, but OpenAI types don't know it. If needed, cast the whole config or ignore.
            messages: [
              { role: "system", content: systemPrompt },
              ...historyMessages,
            ],
            temperature: 0.6,
            max_tokens: 1024,
          } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming);

          const aiText = aiResponse.choices[0]?.message?.content;

          if (aiText) {
            await ctx.db.insert(messages).values({
              conversationId,
              senderId: AI_USER_ID,
              content: aiText,
            });

            // Update timestamp again for the new message
            await ctx.db
              .update(conversations)
              .set({ updatedAt: new Date() })
              .where(eq(conversations.id, conversationId));
          }
        } catch (error) {
          console.error("AI Generation Failed:", error);
          // We don't throw here to avoid failing the user's message send
        }
      }

      return newMessage;
    }),

  // Get messages for a conversation
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { conversationId, limit, cursor } = input;
      const currentUserId = ctx.session.user.id;

      // Verify participation
      const [participation] = await ctx.db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, currentUserId),
          ),
        );

      if (!participation) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not a participant",
        });
      }

      const baseConditions = and(
        eq(messages.conversationId, conversationId),
        sql`${messages.deletedAt} IS NULL`,
        sql`NOT (${messages.deletedForUserIds}::uuid[] @> ARRAY[${currentUserId}]::uuid[])`,
      );

      const conditions = cursor
        ? and(
            baseConditions,
            sql`${messages.createdAt} < (SELECT "createdAt" FROM ${messages} WHERE id = ${cursor})`,
          )
        : baseConditions;

      const fetchedMessages = await ctx.db
        .select({
          id: messages.id,
          content: messages.content,
          createdAt: messages.createdAt,
          senderId: messages.senderId,
          senderName: users.name,
          senderAvatar: userProfiles.avatarUrl,
          replyToId: messages.replyToId,
          isForwarded: messages.isForwarded,
          updatedAt: messages.updatedAt,
          deletedAt: messages.deletedAt,
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(conditions)
        .orderBy(desc(messages.createdAt))
        .limit(limit + 1);

      const hasNextPage = fetchedMessages.length > limit;
      const finalMessages = hasNextPage
        ? fetchedMessages.slice(0, -1)
        : fetchedMessages;
      const nextCursor = hasNextPage
        ? finalMessages[finalMessages.length - 1]?.id
        : undefined;

      // Fetch media for messages
      const messageIds = finalMessages.map((m) => m.id);
      const mediaMap = new Map<string, (typeof messageMedia.$inferSelect)[]>();
      const reactionsMap = new Map<
        string,
        (typeof messageReactions.$inferSelect)[]
      >();
      const replyMap = new Map<
        string,
        { id: string; content: string | null; senderName: string | null }
      >();

      if (messageIds.length > 0) {
        // Fetch Media
        const media = await ctx.db
          .select()
          .from(messageMedia)
          .where(inArray(messageMedia.messageId, messageIds));

        media.forEach((m) => {
          const arr = mediaMap.get(m.messageId) ?? [];
          arr.push(m);
          mediaMap.set(m.messageId, arr);
        });

        // Fetch Reactions
        const reactions = await ctx.db
          .select()
          .from(messageReactions)
          .where(inArray(messageReactions.messageId, messageIds));

        reactions.forEach((r) => {
          const arr = reactionsMap.get(r.messageId) ?? [];
          arr.push(r);
          reactionsMap.set(r.messageId, arr);
        });

        // Fetch Replies
        const replyIds = finalMessages
          .map((m) => m.replyToId)
          .filter((id): id is string => id !== null);

        if (replyIds.length > 0) {
          const replies = await ctx.db
            .select({
              id: messages.id,
              content: messages.content,
              senderName: users.name,
            })
            .from(messages)
            .innerJoin(users, eq(messages.senderId, users.id))
            .where(inArray(messages.id, replyIds));

          replies.forEach((r) => {
            replyMap.set(r.id, r);
          });
        }
      }

      const results = finalMessages.map((msg) => ({
        ...msg,
        media: mediaMap.get(msg.id) ?? [],
        reactions: reactionsMap.get(msg.id) ?? [],
        replyTo: msg.replyToId ? replyMap.get(msg.replyToId) : null,
      }));

      return {
        messages: results.reverse(),
        nextCursor,
      };
    }),

  // Mark conversation as read
  markAsRead: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      await ctx.db
        .update(conversationParticipants)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, currentUserId),
          ),
        );

      return { success: true };
    }),

  // Add participants to group
  addParticipants: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        participantIds: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { conversationId, participantIds } = input;
      const currentUserId = ctx.session.user.id;

      // Verify initiator is participant
      const [participation] = await ctx.db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, currentUserId),
          ),
        );

      if (!participation) throw new TRPCError({ code: "FORBIDDEN" });

      // Verify conversation is group
      const [conv] = await ctx.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId));

      if (conv?.type !== "group") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only add to groups",
        });
      }

      // Add new participants
      await ctx.db
        .insert(conversationParticipants)
        .values(
          participantIds.map((userId) => ({
            conversationId,
            userId,
          })),
        )
        .onConflictDoNothing();

      return { success: true };
    }),

  // Leave conversation
  leaveConversation: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      await ctx.db
        .delete(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, currentUserId),
          ),
        );

      return { success: true };
    }),

  // Search users for new chat
  searchUsers: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      const results = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          avatarUrl: userProfiles.avatarUrl,
          collegeId: users.collegeId,
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(
          and(
            sql`${users.id} != ${currentUserId}`,
            or(
              sql`${users.name} ILIKE ${"%" + input.query + "%"}`,
              sql`${users.email} ILIKE ${"%" + input.query + "%"}`,
            ),
          ),
        )
        .limit(10);

      return results;
    }),

  // Toggle Reaction
  react: protectedProcedure
    .input(
      z.object({
        messageId: z.string().uuid(),
        type: z.enum([
          "like",
          "dislike",
          "heart",
          "angry",
          "laugh",
          "wow",
          "sad",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { messageId, type } = input;
      const currentUserId = ctx.session.user.id;

      // Check if reaction already exists
      const existingReaction = await ctx.db
        .select()
        .from(messageReactions)
        .where(
          and(
            eq(messageReactions.messageId, messageId),
            eq(messageReactions.userId, currentUserId),
          ),
        )
        .limit(1);

      if (existingReaction.length > 0) {
        const reaction = existingReaction[0]!;
        if (reaction.reactionType === type) {
          // Remove if same type
          await ctx.db
            .delete(messageReactions)
            .where(eq(messageReactions.id, reaction.id));
          return { action: "removed" };
        } else {
          // Update if different type
          await ctx.db
            .update(messageReactions)
            .set({ reactionType: type })
            .where(eq(messageReactions.id, reaction.id));
          return { action: "updated" };
        }
      } else {
        // Create new reaction
        await ctx.db.insert(messageReactions).values({
          messageId,
          userId: currentUserId,
          reactionType: type,
        });
        return { action: "added" };
      }
    }),

  // Edit Message
  editMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string().uuid(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { messageId, content } = input;
      const currentUserId = ctx.session.user.id;

      const [msg] = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId));

      if (!msg) throw new TRPCError({ code: "NOT_FOUND" });
      if (msg.senderId !== currentUserId)
        throw new TRPCError({ code: "FORBIDDEN" });

      await ctx.db
        .update(messages)
        .set({ content, updatedAt: new Date() })
        .where(eq(messages.id, messageId));

      return { success: true };
    }),

  // Delete Message for Me (soft delete for current user only)
  deleteMessageForMe: protectedProcedure
    .input(
      z.object({
        messageId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { messageId } = input;
      const currentUserId = ctx.session.user.id;

      // Check message exists
      const [msg] = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId));

      if (!msg) throw new TRPCError({ code: "NOT_FOUND" });

      // Verify user is participant in the conversation
      const [participation] = await ctx.db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, msg.conversationId),
            eq(conversationParticipants.userId, currentUserId),
          ),
        );

      if (!participation) throw new TRPCError({ code: "FORBIDDEN" });

      // Add user to deleted for list (using uuid array column)
      const currentDeletedFor: string[] = msg.deletedForUserIds ?? [];
      if (!currentDeletedFor.includes(currentUserId)) {
        await ctx.db
          .update(messages)
          .set({
            deletedForUserIds: [...currentDeletedFor, currentUserId],
            updatedAt: new Date(),
          })
          .where(eq(messages.id, messageId));
      }

      return { success: true };
    }),

  // Delete Message for Everyone (only sender can do this)
  deleteMessageForAll: protectedProcedure
    .input(
      z.object({
        messageId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { messageId } = input;
      const currentUserId = ctx.session.user.id;

      const [msg] = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId));

      if (!msg) throw new TRPCError({ code: "NOT_FOUND" });
      if (msg.senderId !== currentUserId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the sender can delete for everyone",
        });
      }

      // Soft delete for all using deletedAt timestamp
      await ctx.db
        .update(messages)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(messages.id, messageId));

      return { success: true };
    }),
});
