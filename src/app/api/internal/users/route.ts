import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { users, userProfiles } from "~/server/db/schema";
import { env } from "~/env.js";
import { eq, inArray } from "drizzle-orm";

const requestSchema = z.object({
  userIds: z.array(z.string().uuid()),
});

export type UserData = {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  isAdmin: boolean;
  emailVerified: boolean;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
};

/**
 * Internal API endpoint for Convex to fetch user data from PostgreSQL
 * This keeps PostgreSQL as the source of truth for user data
 *
 * POST /api/internal/users
 * Headers: Authorization: Bearer <INTERNAL_API_KEY>
 * Body: { userIds: string[] }
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${env.INTERNAL_API_KEY}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userIds } = requestSchema.parse(body);

    if (userIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Fetch users from PostgreSQL with their profiles
    const usersData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        collegeId: users.collegeId,
        isAdmin: users.isAdmin,
        emailVerified: users.emailVerified,
        avatarUrl: userProfiles.avatarUrl,
        bio: userProfiles.bio,
        location: userProfiles.location,
        website: userProfiles.website,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(inArray(users.id, userIds));

    return NextResponse.json({ users: usersData });
  } catch (error) {
    console.error("Error fetching users from internal API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
