"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Search, User, Ban, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Restriction {
  id: string;
  expiresAt?: Date | null;
  type?: string;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const {
    data: usersData,
    refetch,
    isLoading,
    error,
  } = api.admin.users.search.useQuery({
    query: searchQuery || undefined,
    limit: 50,
  });

  if (error) {
    console.error("admin.users.search error", error);
  }

  console.log("admin.users.search data", usersData);

  const banMutation = api.admin.users.ban.useMutation({
    onSuccess: async () => {
      await refetch();
      setSelectedUser(null);
    },
  });

  const unbanMutation = api.admin.users.unban.useMutation({
    onSuccess: async () => {
      await refetch();
    },
  });

  const getActiveRestriction = (
    restrictions: Array<Restriction> | undefined,
  ) => {
    if (!restrictions || restrictions.length === 0) return null;
    const now = new Date();
    return restrictions.find((r) => {
      if (!r.expiresAt) return true;
      return new Date(r.expiresAt) > now;
    });
  };

  return (
    <div className="space-y-8 p-2 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs tracking-[0.2em] text-[#D4AF37] uppercase">
            Directory
          </p>
          <h1 className="text-3xl font-light text-[#0a1628] sm:text-4xl">
            User Management
          </h1>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#0a1628]/40" />
          <input
            type="text"
            placeholder="Search by name, email, or college ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#0a1628]/10 bg-white py-3 pr-11 pl-4 text-sm text-[#0a1628] shadow-sm transition-all placeholder:text-[#0a1628]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/40 py-16 text-center">
            <div className="mb-4 rounded-full bg-red-100 p-4 text-red-500">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-red-800">
              Failed to load users
            </h3>
            <p className="text-sm text-red-700/80">
              {error.message ?? "An unexpected error occurred while fetching users."}
            </p>
          </div>
        ) : !usersData?.users || usersData.users.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0a1628]/10 py-16 text-center">
            <div className="mb-4 rounded-full bg-[#0a1628]/5 p-4 text-[#0a1628]/40">
              <User className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-[#0a1628]">
              No records found
            </h3>
            <p className="text-[#0a1628]/50">Try refining your search query</p>
          </div>
        ) : (
          usersData.users.map((user) => {
            const restrictions = user.restrictions;
            const hasActiveRestriction = getActiveRestriction(restrictions);
            const isBanned =
              hasActiveRestriction && restrictions?.[0]?.type === "ban";

            return (
              <div
                key={user.id}
                className={`group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-[#D4AF37]/30 hover:shadow-md ${
                  isBanned
                    ? "border-red-200 bg-red-50/10"
                    : "border-[#0a1628]/5"
                }`}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/20 bg-[#faf7f0]">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-[#0a1628]">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-[#0a1628]">
                          {user.name}
                        </h3>
                        {user.isAdmin && (
                          <span className="rounded-full bg-[#0a1628] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase">
                            Admin
                          </span>
                        )}
                        {isBanned && (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700 uppercase">
                            <Ban size={10} />
                            Restricted
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#0a1628]/60">
                        <span className="font-mono">{user.email}</span>
                        <span className="hidden h-1 w-1 rounded-full bg-[#D4AF37]/50 sm:block" />
                        <span className="font-mono">
                          {user.collegeId || "N/A"}
                        </span>
                        <span className="hidden h-1 w-1 rounded-full bg-[#D4AF37]/50 sm:block" />
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-[#D4AF37]" />
                          {format(new Date(user.createdAt), "d MMM yyyy", {
                            locale: ar,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {!user.isAdmin && (
                      <div className="flex gap-2">
                        {isBanned ? (
                          <button
                            onClick={() => {
                              const restriction =
                                getActiveRestriction(restrictions);
                              if (restriction) {
                                unbanMutation.mutate({
                                  restrictionId: restriction.id,
                                });
                              }
                            }}
                            disabled={unbanMutation.isPending}
                            className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                            Restore Access
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedUser(user.id)}
                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                          >
                            <Ban size={14} />
                            Restrict
                          </button>
                        )}
                      </div>
                    )}
                    <a
                      href={`/admin/users?id=${user.id}`}
                      className="rounded-lg border border-[#0a1628]/10 bg-white px-4 py-2 text-xs font-medium text-[#0a1628] transition-colors hover:border-[#D4AF37]/50 hover:bg-[#faf7f0]"
                    >
                      Profile
                    </a>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedUser === user.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden rounded-xl bg-[#faf7f0]"
                    >
                      <div className="p-4">
                        <h4 className="mb-3 text-xs font-bold tracking-wider text-[#0a1628] uppercase">
                          Confirm Restriction
                        </h4>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            banMutation.mutate({
                              userId: user.id,
                              reason: formData.get("reason") as string,
                            });
                          }}
                          className="flex gap-3"
                        >
                          <input
                            type="text"
                            name="reason"
                            placeholder="Reason for restriction..."
                            required
                            className="flex-1 rounded-lg border border-[#0a1628]/10 bg-white px-4 py-2 text-sm text-[#0a1628] placeholder:text-[#0a1628]/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={banMutation.isPending}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedUser(null)}
                            className="rounded-lg border border-[#0a1628]/10 bg-white px-4 py-2 text-sm font-medium text-[#0a1628] transition-colors hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
