"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Check } from "lucide-react";

export function MediaViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isOpen = searchParams.get("media") === "true";
  const mediaUrl = searchParams.get("mediaUrl");
  const mediaType = searchParams.get("mediaType") as "image" | "video" | null;
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("media");
    newParams.delete("mediaUrl");
    newParams.delete("mediaType");
    newParams.delete("postId");
    newParams.delete("authorName");
    router.replace(
      `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`,
      { scroll: false },
    );
  };

  const handleDownload = async () => {
    if (!mediaUrl) return;
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = mediaUrl.split("/").pop() ?? "media";
      link.download =
        mediaType === "image"
          ? filename.replace(/\?.*$/, "")
          : `${filename.replace(/\?.*$/, "")}.${mediaType === "video" ? "mp4" : "webm"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      const link = document.createElement("a");
      link.href = mediaUrl;
      link.target = "_blank";
      link.download = mediaUrl.split("/").pop() ?? "media";
      link.click();
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const authorName = searchParams.get("authorName");
    if (navigator.share) {
      try {
        await navigator.share({
          url,
          title: authorName ? `من ${authorName}` : undefined,
        });
      } catch (e) {
        console.error("Error sharing:", e);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
      } catch (e) {
        console.error("Error copying to clipboard:", e);
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !mediaUrl || !mediaType) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="media-viewer-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-midnight/95 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.button
            key="close-button"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:top-8 sm:right-8"
            aria-label="إغلاق"
          >
            <X size={24} />
          </motion.button>

          <motion.div
            key="media-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex max-h-[90vh] max-w-[95vw] items-center justify-center"
          >
            {mediaType === "image" ? (
              <div className="relative max-h-[90vh] max-w-[95vw]">
                <Image
                  src={mediaUrl}
                  alt="Media"
                  width={1920}
                  height={1080}
                  className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
                />
              </div>
            ) : (
              <div className="relative max-h-[90vh] max-w-[95vw]">
                <video
                  src={mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[90vh] max-w-[95vw] rounded-lg shadow-2xl"
                />
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute right-4 bottom-4 left-4 flex justify-center gap-3 sm:right-8 sm:bottom-8 sm:left-8"
            >
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <Download size={20} />
                <span className="hidden sm:inline">تحميل</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                {copiedToClipboard ? <Check size={20} /> : <Share2 size={20} />}
                <span className="hidden sm:inline">
                  {copiedToClipboard ? "تم النسخ" : "مشاركة"}
                </span>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        body {
          overflow: hidden !important;
        }
      `}</style>
    </>
  );
}
