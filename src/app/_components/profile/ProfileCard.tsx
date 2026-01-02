"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Globe,
  Calendar,
  Edit2,
  MessageCircle,
  AlertTriangle,
  MoreHorizontal,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { ReportModal } from "../modals/ReportModal";
import { useToast } from "../ui/Toast";

interface ProfileCardProps {
  profile: {
    userId: string;
    name: string;
    email: string;
    collegeId: string;
    bio: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    location: string | null;
    website: string | null;
    createdAt: Date;
  };
  isOwnProfile?: boolean;
  postCount?: number;
}

export function ProfileCard({
  profile,
  isOwnProfile = false,
  postCount = 0,
}: ProfileCardProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const joinDate = new Date(profile.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
  });

  const router = useRouter();
  const toast = useToast();
  const createConversationMutation = api.chat.createConversation.useMutation({
    onSuccess: (data) => {
      router.push(`/chat?c=${data.conversationId}`);
    },
  });

  const handleMessage = () => {
    createConversationMutation.mutate({
      type: "private",
      participantIds: [profile.userId],
    });
  };

  const handleChangePassword = async () => {
    setShowConfirmDialog(true);
  };

  const confirmChangePassword = async () => {
    setShowConfirmDialog(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: profile.email }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(data.error ?? "حدث خطأ. يرجى المحاولة مرة أخرى.");
        return;
      }

      toast.success(
        "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
      );
    } catch {
      toast.error("حدث خطأ. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="elegant-card overflow-hidden rounded-2xl"
    >
      {/* Cover Image */}
      <div className="from-gold/30 via-gold/20 to-copper/20 relative h-48 bg-gradient-to-br">
        {profile.coverUrl && (
          <Image
            src={profile.coverUrl}
            alt="غلاف الملف الشخصي"
            fill
            className="object-cover"
          />
        )}
        <div className="from-midnight/20 absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>

      {/* Profile Info Section */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4 flex items-end justify-between">
          <div className="bg-gold/20 relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-gold flex h-full w-full items-center justify-center text-4xl font-bold">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Edit button for own profile */}
          <div className="flex gap-2">
            {!isOwnProfile && (
              <div className="relative flex gap-2">
                <motion.button
                  onClick={handleMessage}
                  disabled={createConversationMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-gold)] px-4 py-2 font-medium text-[var(--color-midnight)] transition-colors hover:bg-[#C5A028] disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageCircle size={16} />
                  <span>مراسلة</span>
                </motion.button>

                <div className="relative">
                  <motion.button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center justify-center rounded-xl bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MoreHorizontal size={20} />
                  </motion.button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute bottom-full left-0 z-50 mb-2 min-w-[140px] rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5"
                      >
                        <button
                          onClick={() => {
                            setShowReportModal(true);
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-orange-600 transition-colors hover:bg-orange-50"
                        >
                          <AlertTriangle size={16} />
                          <span className="text-sm font-bold">إبلاغ</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            )}

            {isOwnProfile && (
              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-2 rounded-xl border border-[#0A1628]/20 bg-white px-4 py-2 font-medium text-[#0A1628] transition-colors hover:bg-[#0A1628]/5"
                >
                  <Lock size={16} />
                  <span>كلمة المرور</span>
                </button>
                <Link href="/profile/edit">
                  <motion.button
                    className="bg-gold text-midnight hover:bg-gold-light flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit2 size={16} />
                    <span>تعديل</span>
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetId={profile.userId}
          targetType="user"
        />

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowConfirmDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#FAF7F0] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4A853]/20">
                  <Lock className="h-8 w-8 text-[#D4A853]" />
                </div>
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-[#0A1628]">
                تغيير كلمة المرور
              </h3>
              <p className="mb-6 text-center text-[#0A1628]/60">
                هل أنت متأكد أنك تريد تغيير كلمة المرور؟ سيتم إرسال رابط لإعادة
                تعيين كلمة المرور إلى بريدك الإلكتروني.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 rounded-lg border border-[#0A1628]/20 py-3 font-bold text-[#0A1628] transition-all hover:bg-[#0A1628]/5"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmChangePassword}
                  className="flex-1 cursor-pointer rounded-lg bg-[#0A1628] py-3 font-bold text-[#D4A853] transition-all hover:bg-[#0A1628]/90"
                >
                  نعم، متأكد
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* Name and Bio */}
        <div className="mb-4">
          <h1 className="text-midnight text-2xl font-bold">{profile.name}</h1>
          <p className="text-midnight/50">@{profile.collegeId}</p>
          {profile.bio && (
            <p className="text-midnight/80 mt-3 leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Meta info */}
        <div className="text-midnight/60 flex flex-wrap items-center gap-4 text-sm">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold flex items-center gap-1 hover:underline"
            >
              <Globe size={14} />
              <span>الموقع</span>
            </a>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>انضم في {joinDate}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="border-midnight/10 mt-4 flex gap-6 border-t pt-4">
          <div className="text-center">
            <p className="text-midnight text-2xl font-bold">{postCount}</p>
            <p className="text-midnight/50 text-sm">منشور</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
