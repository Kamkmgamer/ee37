import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "~/lib/session";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schema";
import {
  LayoutDashboard,
  Flag,
  Users,
  FileText,
  MessageSquare,
  GraduationCap,
  History,
  Bell,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Reports", href: "/admin/reports", icon: Flag },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Content", href: "/admin/content", icon: FileText },
  { name: "Learning", href: "/admin/learning", icon: GraduationCap },
  { name: "Audit Log", href: "/admin/audit", icon: History },
  { name: "Announcements", href: "/admin/announcements", icon: Bell },
];

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

  if (!user || !user.isAdmin) {
    redirect("/feed");
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-midnight w-64 text-white shadow-xl">
          <div className="flex h-16 items-center justify-center border-b border-gray-700">
            <h1 className="text-xl font-bold">EE37 Admin</h1>
          </div>

          <nav className="mt-6 px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 w-64 border-t border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]">
                <span className="text-midnight font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
