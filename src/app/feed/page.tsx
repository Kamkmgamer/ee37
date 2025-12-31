import { redirect } from "next/navigation";
import { verifySession } from "~/lib/session";
import { api } from "~/trpc/server";
import { CreatePostForm } from "../_components/feed/CreatePostForm";
import { FeedClient } from "./FeedClient";
import { PageHeader } from "../_components/PageHeader";

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
        })
      : {};

  const profile = await api.profile.getProfile({ userId: session.userId });

  return (
    <div className="bg-paper min-h-screen">
      <PageHeader
        title="المنشورات"
        showNav={true}
        activeNav="feed"
        isAdmin={profile?.isAdmin ?? false}
      />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Create post form */}
        <div className="mb-6">
          <CreatePostForm
            _userId={session.userId}
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
