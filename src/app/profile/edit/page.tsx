import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, User, ArrowRight } from "lucide-react";
import { verifySession } from "~/lib/session";
import { api } from "~/trpc/server";
import { ProfileEditForm } from "../../_components/profile/ProfileEditForm";

export default async function EditProfilePage() {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  const profile = await api.profile.getProfile({ userId: session.userId });

  return (
    <div className="bg-paper min-h-screen">
      {/* Header */}
      <header className="border-midnight/10 bg-paper/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-midnight/60 hover:bg-midnight/5 rounded-xl p-2 transition-colors"
            >
              <ArrowRight size={20} />
            </Link>
            <h1 className="font-display text-midnight text-xl font-bold">
              تعديل الملف الشخصي
            </h1>
          </div>
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
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="elegant-card rounded-2xl p-6">
          <ProfileEditForm
            _userId={session.userId}
            initialData={{
              name: session.name,
              bio: profile?.bio ?? null,
              avatarUrl: profile?.avatarUrl ?? null,
              coverUrl: profile?.coverUrl ?? null,
              location: profile?.location ?? null,
              website: profile?.website ?? null,
            }}
          />
        </div>
      </main>
    </div>
  );
}
