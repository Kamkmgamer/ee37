/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

export const generateResponse = action({
  args: {
    conversationId: v.id("conversations"),
    replyToMessageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch context
    const messages = (await ctx.runQuery(internal.chat.getRecentMessagesForAI, {
      conversationId: args.conversationId,
    })) as any[];

    // 2. Format for OpenAI
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Setup OpenAI / Cerebras
    const apiKey = process.env.CEREBRAS_API_KEY ?? process.env.OPENAI_API_KEY;
    const baseURL = process.env.CEREBRAS_API_KEY
      ? "https://api.cerebras.ai/v1"
      : undefined;

    if (!apiKey) {
      console.error("No API key found for AI generation");
      return;
    }

    const openai = new OpenAI({ apiKey, baseURL });

    try {
      // 4. Call LLM
      const completion = await openai.chat.completions.create({
        model: "llama3.1-8b", // Default for Cerebras, or "gpt-4o" for OpenAI
        messages: [
          {
            role: "system",
            content:
              "You are a helpful and friendly AI assistant participating in a group chat. Keep your responses concise and engaging.",
          },
          ...formattedMessages,
        ],
      });

      const responseContent = completion.choices[0]!.message.content;

      if (responseContent) {
        // 5. Send response
        await ctx.runMutation(internal.chat.sendAIMessage, {
          conversationId: args.conversationId,
          content: responseContent,
        });
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
    }
  },
});
