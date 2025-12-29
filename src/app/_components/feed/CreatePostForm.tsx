"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Send, Loader2 } from "lucide-react";
import { useUploadThing } from "~/lib/uploadthing";
import { api } from "~/trpc/react";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface CreatePostFormProps {
  userId: string;
  userAvatar?: string | null;
  userName: string;
  onPostCreated?: () => void;
}

export function CreatePostForm({
  userId,
  userAvatar,
  userName,
  onPostCreated,
}: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("postMedia", {
    onUploadBegin: () => setIsUploading(true),
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res) {
        const newMedia = res.map((file) => ({
          url: file.url,
          type: file.type?.startsWith("video")
            ? ("video" as const)
            : ("image" as const),
        }));
        setMedia((prev) => [...prev, ...newMedia].slice(0, 4));
      }
    },
    onUploadError: () => {
      setIsUploading(false);
    },
  });

  const utils = api.useUtils();

  const createPost = api.feed.createPost.useMutation({
    onSuccess: async () => {
      setContent("");
      setMedia([]);
      await utils.feed.getPosts.invalidate();
      onPostCreated?.();
    },
  });

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) return;

    await createPost.mutateAsync({
      authorId: userId,
      content: content.trim(),
      mediaUrls: media.length > 0 ? media : undefined,
    });
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const canSubmit =
    (content.trim().length > 0 || media.length > 0) && !createPost.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="elegant-card rounded-2xl p-3 sm:p-5"
    >
      {/* Header with avatar */}
      <div className="mb-4 flex items-start gap-3">
        <div className="bg-gold/20 relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt={userName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-gold flex h-full w-full items-center justify-center text-lg font-bold">
              {userName.charAt(0)}
            </div>
          )}
        </div>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          placeholder="ماذا يدور في ذهنك؟"
          className="premium-input text-midnight placeholder:text-midnight/40 min-h-[60px] w-full resize-none rounded-xl bg-white/60 px-4 py-3 focus:outline-none"
          rows={2}
        />
      </div>

      {/* Media preview */}
      <AnimatePresence>
        {media.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex flex-wrap gap-2"
          >
            {media.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative h-24 w-24 overflow-hidden rounded-xl"
              >
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className="bg-midnight/80 absolute top-1 right-1 rounded-full p-1 text-white transition-colors hover:bg-red-500"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="border-midnight/10 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-2">
          {/* Upload button */}
          <div className="relative">
            {isUploading ? (
              <div className="text-midnight/50 flex items-center gap-2 px-3 py-2">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">جاري الرفع...</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gold text-midnight hover:bg-gold-light flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-all hover:scale-[1.02]"
                >
                  <ImagePlus size={18} className="shrink-0" />
                  <span>صورة / فيديو</span>
                </button>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={async (e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      await startUpload(files);
                    }
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Submit button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="shimmer-btn text-midnight flex h-10 items-center gap-2 rounded-xl px-6 py-2 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          whileTap={canSubmit ? { scale: 0.98 } : {}}
        >
          {createPost.isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
