import { verifySession } from "~/lib/session";
import LandingPage from "./_components/landing-page";
import { api } from "~/trpc/server";
import { type RouterOutputs } from "~/trpc/react";

type Post = RouterOutputs["feed"]["getPosts"]["posts"][number];

export default async function Page() {
  const session = await verifySession();

  let posts: Post[] = [];
  let userReactions: Record<string, string> = {};

  if (session) {
    try {
      const feedData = await api.feed.getPosts({ limit: 3 });
      posts = feedData.posts;

      if (posts.length > 0) {
        userReactions = await api.reactions.getUserReactionsForPosts({
          postIds: posts.map((p) => p.id),
          userId: session.userId,
        });
      }
    } catch (error) {
      console.error("Error fetching posts for preview:", error);
    }
  }

  return (
    <LandingPage user={session} posts={posts} userReactions={userReactions} />
  );
}
