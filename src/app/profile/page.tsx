import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, User, LogOut } from "lucide-react";
import { verifySession, deleteSession } from "~/lib/session";
import { api } from "~/trpc/server";
import { ProfileCard } from "../_components/profile/ProfileCard";
import { PostCard } from "../_components/feed/PostCard";

export default async function ProfilePage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  const profile = await api.profile.getProfile({ userId: session.userId });

  if (!profile) {
    redirect("/login");
  }

  const { posts } = await api.feed.getPostsByUser({
    userId: session.userId,
    limit: 20,
  });

  const userReactions =
    posts.length > 0
      ? await api.reactions.getUserReactionsForPosts({
          postIds: posts.map((p) => p.id),
        })
      : {};

  return (
    <div className="bg-paper min-h-screen">
      {/* Header */}
      <header className="border-midnight/10 bg-paper/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="font-display text-midnight text-xl font-bold">
            الملف الشخصي
          </h1>
          <nav className="flex items-center gap-2">
            <Link
              href="/feed"
              className="text-midnight/60 hover:bg-midnight/5 rounded-xl p-2 transition-colors"
            >
              <Home size={20} />
            </Link>
            <Link
              href="/profile"
              className="bg-gold/10 text-gold hover:bg-gold/20 rounded-xl p-2 transition-colors"
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
        {/* Profile Card */}
        <div className="mb-6">
          <ProfileCard
            profile={profile}
            isOwnProfile={true}
            postCount={posts.length}
          />
        </div>

        {/* User's posts */}
        <div className="space-y-6">
          <h2 className="font-display text-midnight text-lg font-semibold">
            منشوراتي
          </h2>
          {posts.length === 0 ? (
            <div className="elegant-card rounded-2xl p-8 text-center">
              <p className="text-midnight/60">لم تنشر شيئاً بعد</p>
              <Link
                href="/feed"
                className="text-gold mt-2 inline-block hover:underline"
              >
                ابدأ بمشاركة أفكارك
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={session.userId}
                userReaction={userReactions[post.id]}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
