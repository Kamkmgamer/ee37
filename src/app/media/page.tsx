"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { MediaViewer } from "~/app/_components/feed/MediaViewer";

export default function MediaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const mediaUrl = searchParams.get("url");
  const mediaType = searchParams.get("type") as "image" | "video" | null;
  const postId = searchParams.get("postId") ?? undefined;
  const authorName = searchParams.get("author") ?? undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if ((mounted && !mediaUrl) ?? !mediaType) {
      router.push("/");
    }
  }, [mediaUrl, mediaType, mounted, router]);

  useEffect(() => {
    if (mediaUrl && mediaType) {
      const newParams = new URLSearchParams();
      newParams.set("media", "true");
      newParams.set("mediaUrl", mediaUrl);
      newParams.set("mediaType", mediaType);
      if (postId) newParams.set("postId", postId);
      if (authorName) newParams.set("authorName", authorName);

      router.replace(`?${newParams.toString()}`, { scroll: false });
    }
  }, [authorName, mediaType, mediaUrl, postId, router]);

  if (!mounted || !mediaUrl || !mediaType) {
    return (
      <div className="bg-paper flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="text-gold h-12 w-12 animate-spin" />
          <p className="text-midnight/60">جاري التحميل...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen">
      <MediaViewer />
    </div>
  );
}
