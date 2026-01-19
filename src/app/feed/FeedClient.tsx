"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { SessionData } from "~/lib/session";
import { Loader2 } from "lucide-react";
import { FeedReady } from "./FeedReady";

interface FeedClientProps {
  currentUserId: string;
  user: SessionData;
  initialPosts?: any[];
  initialNextCursor?: string;
  initialUserReactions?: any;
}

export function FeedClient({ currentUserId, user }: FeedClientProps) {
  const [isSynced, setIsSynced] = useState(false);

  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (user && currentUserId) {
      void (async () => {
        await syncUser({
          externalId: (user as any).userId || currentUserId,
          name: user.name,
          email: user.email,
          avatarUrl: undefined,
          collegeId: (user as any).collegeId,
        });
        setIsSynced(true);
      })();
    }
  }, [user, currentUserId, syncUser]);

  if (!isSynced) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return <FeedReady currentUserId={currentUserId} />;
}
