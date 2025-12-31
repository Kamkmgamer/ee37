"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Search, User, Ban, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";

interface Restriction {
  id: string;
  expiresAt?: Date | null;
  type?: string;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: usersData, refetch } = api.admin.users.search.useQuery({
    query: searchQuery || undefined,
    limit: 50,
  });

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-gray-500">Search and manage users</p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or college ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-10 pl-4 text-sm placeholder-gray-500 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
        />
      </div>

      <div className="grid gap-4">
        {!usersData?.users || usersData.users.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No users found
            </h3>
            <p className="mt-2 text-gray-500">Try a different search query</p>
          </div>
        ) : (
          usersData.users.map((user) => {
            const userWithRestrictions = user as {
              id: string;
              name: string;
              email: string;
              collegeId: string;
              isAdmin: boolean;
              createdAt: Date;
              avatarUrl: string | null;
              restrictions?: Array<Restriction> | undefined;
            };
            const restrictions = userWithRestrictions.restrictions;
            const hasActiveRestriction = getActiveRestriction(restrictions);
            const isBanned =
              hasActiveRestriction && restrictions?.[0]?.type === "ban";

            return (
              <div
                key={user.id}
                className={`rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                  isBanned ? "ring-2 ring-red-200" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#D4AF37]">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-midnight font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        {user.isAdmin && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            Admin
                          </span>
                        )}
                        {isBanned && (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            <Ban size={12} />
                            Banned
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <span>{user.email}</span>
                        <span>{user.collegeId}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {format(new Date(user.createdAt), "d MMM yyyy", {
                            locale: ar,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!user.isAdmin && (
                      <>
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
                            className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
                          >
                            <CheckCircle size={18} />
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedUser(user.id)}
                            className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                          >
                            <Ban size={18} />
                            Ban
                          </button>
                        )}
                      </>
                    )}
                    <a
                      href={`/admin/users?id=${user.id}`}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                    >
                      View Details
                    </a>
                  </div>
                </div>

                {selectedUser === user.id && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 font-medium text-gray-900">Ban User</h4>
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
                        placeholder="Ban reason..."
                        required
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={banMutation.isPending}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                      >
                        Confirm Ban
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
