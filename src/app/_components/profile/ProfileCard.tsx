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
} from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { ReportModal } from "../modals/ReportModal";

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
  const joinDate = new Date(profile.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
  });

  const router = useRouter();
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
            )}
          </div>
        </div>

        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetId={profile.userId}
          targetType="user"
        />

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
