import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, User, LogOut } from "lucide-react";
import { verifySession, deleteSession } from "~/lib/session";
import { api } from "~/trpc/server";
import { CreatePostForm } from "../_components/feed/CreatePostForm";
import { FeedClient } from "./FeedClient";

export default async function FeedPage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  const { posts, nextCursor } = await api.feed.getPosts({ limit: 10 });

  const userReactions =
    posts.length > 0
      ? await api.reactions.getUserReactionsForPosts({
          postIds: posts.map((p) => p.id),
          userId: session.userId,
        })
      : {};

  const profile = await api.profile.getProfile({ userId: session.userId });

  return (
    <div className="bg-paper min-h-screen">
      {/* Header */}
      <header className="border-midnight/10 bg-paper/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="font-display text-midnight text-xl font-bold">
            المنشورات
          </h1>
          <nav className="flex items-center gap-2">
            <Link
              href="/feed"
              className="bg-gold/10 text-gold hover:bg-gold/20 rounded-xl p-2 transition-colors"
            >
              <Home size={20} />
            </Link>
            <Link
              href="/profile"
              className="text-midnight/60 hover:bg-midnight/5 rounded-xl p-2 transition-colors"
            >
              <User size={20} />
            </Link>
            <form
              action={async () => {
                "use server";
                await deleteSession();
                redirect("/login");
              }}
            >
              <button
                type="submit"
                className="text-midnight/60 rounded-xl p-2 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <LogOut size={20} />
              </button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Create post form */}
        <div className="mb-6">
          <CreatePostForm
            userId={session.userId}
            userName={session.name}
            userAvatar={profile?.avatarUrl}
          />
        </div>

        {/* Feed */}
        <FeedClient
          initialPosts={posts}
          initialNextCursor={nextCursor}
          initialUserReactions={userReactions}
          currentUserId={session.userId}
        />
      </main>
    </div>
  );
}
