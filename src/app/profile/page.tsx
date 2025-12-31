import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "~/lib/session";
import { api } from "~/trpc/server";
import { ProfileCard } from "../_components/profile/ProfileCard";
import { PostCard } from "../_components/feed/PostCard";
import { PageHeader } from "../_components/PageHeader";

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
      <PageHeader title="الملف الشخصي" showNav={true} activeNav="profile" />

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
