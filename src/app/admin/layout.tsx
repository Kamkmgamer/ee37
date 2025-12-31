import { redirect } from "next/navigation";

import { verifySession } from "~/lib/session";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schema";
import { AdminLayoutClient } from "./_components/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user?.isAdmin) {
    redirect("/feed");
  }

  return (
    <AdminLayoutClient
      user={{
        name: user.name,
        isAdmin: user.isAdmin,
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
