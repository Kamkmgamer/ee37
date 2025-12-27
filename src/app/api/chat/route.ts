import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { decrypt } from "~/lib/session";
import { cookies } from "next/headers";

export const runtime = "edge";



const SYSTEM_PROMPT = `
You are "خديجة الرسام", a helpful AI assistant for the "EE37" batch.
- Answer in clear, concise Arabic.
- Be helpful and friendly.
`;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, collegeId } = session as { name: string; collegeId: string };

    const { messages } = await req.json() as { messages: { role: "user" | "assistant"; content: string }[] };

    const client = new OpenAI({
      apiKey: process.env.CEREBRAS_API_KEY,
      baseURL: "https://api.cerebras.ai/v1",
    });

    const finalSystemPrompt = `${SYSTEM_PROMPT} User: ${name} (${collegeId}).`;

    const response = await client.chat.completions.create({
      model: "gpt-oss-120b",
      stream: true,
      messages: [
        { role: "system", content: finalSystemPrompt },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 1024,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Chat Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
