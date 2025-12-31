/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { verifySession } from "~/lib/session";

import { db } from "~/server/db";
import { eq, and, or, isNull, gt } from "drizzle-orm";
import { userRestrictions } from "~/server/db/schema";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await verifySession();

  let userData = null;
  let isBanned = false;
  let isMuted = false;

  if (session) {
    userData = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, session.userId),
    });

    if (userData) {
      const now = new Date();

      const banRestriction = await db.query.userRestrictions.findFirst({
        where: and(
          eq(userRestrictions.userId, session.userId),
          eq(userRestrictions.type, "ban"),
          or(
            isNull(userRestrictions.expiresAt),
            gt(userRestrictions.expiresAt, now),
          ),
        ),
      });
      isBanned = !!banRestriction;

      const muteRestriction = await db.query.userRestrictions.findFirst({
        where: and(
          eq(userRestrictions.userId, session.userId),
          eq(userRestrictions.type, "mute"),
          or(
            isNull(userRestrictions.expiresAt),
            gt(userRestrictions.expiresAt, now),
          ),
        ),
      });
      isMuted = !!muteRestriction;
    }
  }

  return {
    db,
    session:
      session && userData
        ? {
            user: {
              id: session.userId,
              userId: session.userId,
              email: session.email,
              name: session.name,
              isAdmin: userData.isAdmin,
              isBanned,
              isMuted,
            },
          }
        : null,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

/**
 * Restricted procedure - for users who are not banned
 *
 * This extends protectedProcedure to also check if the user is banned.
 */
export const restrictedProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.isBanned) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your account has been banned.",
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Unmuted procedure - for users who are not banned or muted
 *
 * This extends restrictedProcedure to also check if the user is muted.
 * Use this for operations that require posting capabilities (comments, posts, chat).
 */
export const unmutedProcedure = restrictedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.isMuted) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are temporarily muted and cannot post.",
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Admin procedure
 *
 * Use this for moderation and administrative actions.
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.session.user.isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
