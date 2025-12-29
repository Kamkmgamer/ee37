import { redirect } from "next/navigation";
import { verifySession } from "~/lib/session";
import { ChatList } from "../_components/chat/ChatList";
import { ChatWindow } from "../_components/chat/ChatWindow";

interface ChatPageProps {
  searchParams: Promise<{ c?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  const activeConversationId = (await searchParams).c;

  return (
    <div className="flex h-screen w-full bg-[#0F0F0F] pt-20">
      <div className="container mx-auto flex h-[calc(100vh-6rem)] max-w-7xl gap-4 overflow-hidden p-4">
        {/* Chat List Sidebar */}
        <div
          className={`w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl md:w-[350px] lg:w-[400px] ${
            activeConversationId ? "hidden md:block" : "block"
          }`}
        >
          <ChatList userId={session.userId} />
        </div>

        {/* Chat Window */}
        <div
          className={`flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl ${
            activeConversationId ? "flex" : "hidden md:flex"
          }`}
        >
          <ChatWindow currentUserId={session.userId} />
        </div>
      </div>
    </div>
  );
}
