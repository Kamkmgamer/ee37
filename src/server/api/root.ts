import { feedRouter } from "~/server/api/routers/feed";
import { postRouter } from "~/server/api/routers/post";
import { profileRouter } from "~/server/api/routers/profile";
import { reactionsRouter } from "~/server/api/routers/reactions";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
import { commentsRouter } from "~/server/api/routers/comments";
import { chatRouter } from "~/server/api/routers/chat";
import { learningRouter } from "~/server/api/routers/learning";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  profile: profileRouter,
  feed: feedRouter,
  reactions: reactionsRouter,
  comments: commentsRouter,
  chat: chatRouter,
  learning: learningRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
