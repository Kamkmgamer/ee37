"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Globe, Calendar, Edit2 } from "lucide-react";

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
  const joinDate = new Date(profile.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
  });

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
          {isOwnProfile && (
            <Link href="/profile/edit">
              <motion.button
                className="bg-gold text-midnight hover:bg-gold-light flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Edit2 size={16} />
              </motion.button>
            </Link>
          )}
        </div>

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
