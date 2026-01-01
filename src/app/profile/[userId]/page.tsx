import { notFound } from "next/navigation";
import Link from "next/link";
import { Home, User, ArrowRight } from "lucide-react";
import { verifySession } from "~/lib/session";
import { api } from "~/trpc/server";
import { ProfileCard } from "../../_components/profile/ProfileCard";
import { PostCard } from "../../_components/feed/PostCard";
import MySubmissions from "../../_components/MySubmissions";

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { userId } = await params;
  const session = await verifySession();

  const profile = await api.profile.getProfile({ userId });

  if (!profile) {
    notFound();
  }

  const isOwnProfile = session?.userId === userId;

  const { posts } = await api.feed.getPostsByUser({
    userId,
    limit: 20,
  });

  const userReactions =
    session && posts.length > 0
      ? await api.reactions.getUserReactionsForPosts({
          postIds: posts.map((p) => p.id),
        })
      : {};

  return (
    <div className="bg-paper min-h-screen">
      <header className="border-midnight/10 bg-paper/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="text-midnight/60 hover:bg-midnight/5 rounded-xl p-2 transition-colors"
            >
              <ArrowRight size={20} />
            </Link>
            <h1 className="font-display text-midnight text-xl font-bold">
              {profile.name}
            </h1>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/feed"
              className="text-midnight/60 hover:bg-midnight/5 rounded-xl p-2 transition-colors"
            >
              <Home size={20} />
            </Link>
            {session && (
              <Link
                href="/profile"
                className="text-midnight/60 hover:bg-midnight/5 rounded-xl p-2 transition-colors"
              >
                <User size={20} />
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6">
          <ProfileCard
            profile={profile}
            isOwnProfile={isOwnProfile}
            postCount={posts.length}
          />
        </div>

        <div className="mb-8">
          <h2
            className="font-display text-midnight mb-4 text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            صور الذكريات
          </h2>
          <MySubmissions userId={userId} isOwnProfile={false} />
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-midnight text-lg font-semibold">
            منشورات {profile.name}
          </h2>
          {posts.length === 0 ? (
            <div className="elegant-card rounded-2xl p-8 text-center">
              <p className="text-midnight/60">لا توجد منشورات بعد</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={session?.userId ?? ""}
                userReaction={userReactions[post.id]}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
