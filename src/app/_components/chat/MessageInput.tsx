"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, X, Loader2, Reply, Edit2 } from "lucide-react";
import { useUploadThing } from "~/lib/uploadthing";
import Image from "next/image";
import { useToast } from "../ui/Toast";

interface Message {
  id: string;
  senderName: string | null;
  content: string | null;
}
interface MessageInputProps {
  onSendMessage: (
    content: string,
    mediaUrls: { url: string; type: "image" | "video" }[],
  ) => Promise<void>;
  onEditMessage?: (content: string) => Promise<void>;
  isLoading: boolean;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
}

export function MessageInput({
  onSendMessage,
  onEditMessage,
  isLoading,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<
    { url: string; type: "image" | "video" }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toast = useToast();

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res) {
        const newMedia = res.map((file) => ({
          url: file.url,
          type: "image" as const,
        }));
        setMedia((prev) => [...prev, ...newMedia]);
      }
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      console.error(error);
      setIsUploading(false);
      toast.error("فشل رفع الملف");
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await startUpload(Array.from(e.target.files));
    }
  };

  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content ?? "");
    }
  }, [editingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && media.length === 0) || isLoading || isUploading)
      return;

    if (editingMessage && onEditMessage) {
      await onEditMessage(content);
    } else {
      await onSendMessage(content, media);
    }

    setContent("");
    setMedia([]);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {/* Reply/Edit Context Banner */}
      {(replyingTo ?? editingMessage) && (
        <div className="flex items-center justify-between rounded-t-xl bg-white/10 px-4 py-2 text-sm text-[#EAEAEA]">
          <div className="flex items-center gap-2">
            {editingMessage ? (
              <>
                <Edit2 size={16} className="text-[#D4AF37]" />
                <span className="font-bold text-[#D4AF37]">تعديل الرسالة</span>
              </>
            ) : (
              <>
                <Reply size={16} className="text-[#D4AF37]" />
                <span className="text-[#A0A0A0]">
                  الرد على{" "}
                  <span className="font-bold text-[#D4AF37]">
                    {replyingTo?.senderName}
                  </span>
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={editingMessage ? onCancelEdit : onCancelReply}
            className="rounded-full p-1 hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <div
              key={index}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10"
            >
              <Image
                src={item.url}
                alt="preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-0.5 right-0.5 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/80"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {isUploading && (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <Loader2 className="animate-spin text-[#D4AF37]" />
            </div>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (content.trim() || media.length > 0) void handleSubmit(e);
              }
            }}
            placeholder="اكتب رسالتك..."
            className="max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-12 text-sm text-[#EAEAEA] placeholder:text-[#A0A0A0] focus:border-[#D4AF37]/50 focus:outline-none"
            dir="auto"
            rows={1}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 left-2 rounded-full p-1.5 text-[#A0A0A0] transition-colors hover:bg-white/10 hover:text-[#D4AF37]"
          >
            <ImagePlus size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        <button
          type="submit"
          disabled={
            (!content.trim() && media.length === 0) || isLoading || isUploading
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-black transition-all hover:bg-[#C5A028] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </form>
  );
}
