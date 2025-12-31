"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Loader2, Save } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/uploadthing/core";
import { api } from "~/trpc/react";

interface ProfileEditFormProps {
  _userId: string;
  initialData: {
    name: string;
    bio: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    location: string | null;
    website: string | null;
  };
  onSave?: () => void;
}

export function ProfileEditForm({
  _userId,
  initialData,
  onSave,
}: ProfileEditFormProps) {
  const [bio, setBio] = useState(initialData.bio ?? "");
  const [location, setLocation] = useState(initialData.location ?? "");
  const [website, setWebsite] = useState(initialData.website ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(initialData.coverUrl);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const router = useRouter();

  const updateProfile = api.profile.updateProfile.useMutation();
  const updateAvatar = api.profile.updateAvatar.useMutation();
  const updateCover = api.profile.updateCover.useMutation();

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      bio: bio || undefined,
      location: location || undefined,
      website: website || "",
    });
    onSave?.();
    router.push("/profile");
    router.refresh();
  };

  const isSaving = updateProfile.isPending;

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="from-gold/30 via-gold/20 to-copper/20 relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br">
        {coverUrl && (
          <Image src={coverUrl} alt="غلاف" fill className="object-cover" />
        )}
        <div className="bg-midnight/20 absolute inset-0 flex items-center justify-center">
          {isUploadingCover ? (
            <Loader2 size={32} className="animate-spin text-white" />
          ) : (
            <UploadButton<OurFileRouter, "coverUploader">
              endpoint="coverUploader"
              onUploadBegin={() => setIsUploadingCover(true)}
              onClientUploadComplete={async (res) => {
                setIsUploadingCover(false);
                if (res?.[0]) {
                  const url = res[0].ufsUrl;
                  setCoverUrl(url);
                  await updateCover.mutateAsync({ coverUrl: url });
                }
              }}
              onUploadError={() => setIsUploadingCover(false)}
              appearance={{
                button:
                  "rounded-xl bg-white/90 px-4 py-2 text-midnight hover:bg-white",
                allowedContent: "hidden",
              }}
              content={{
                button() {
                  return (
                    <div className="flex items-center gap-2">
                      <Camera size={18} />
                      <span>تغيير الغلاف</span>
                    </div>
                  );
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className="flex items-end gap-4">
        <div className="bg-gold/20 relative -mt-20 h-32 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="الصورة الشخصية"
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-gold flex h-full w-full items-center justify-center text-4xl font-bold">
              {initialData.name.charAt(0)}
            </div>
          )}
          <div className="bg-midnight/40 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
            {isUploadingAvatar ? (
              <Loader2 size={24} className="animate-spin text-white" />
            ) : (
              <UploadButton<OurFileRouter, "avatarUploader">
                endpoint="avatarUploader"
                onUploadBegin={() => setIsUploadingAvatar(true)}
                onClientUploadComplete={async (res) => {
                  setIsUploadingAvatar(false);
                  if (res?.[0]) {
                    const url = res[0].ufsUrl;
                    setAvatarUrl(url);
                    await updateAvatar.mutateAsync({ avatarUrl: url });
                  }
                }}
                onUploadError={() => setIsUploadingAvatar(false)}
                appearance={{
                  button: "rounded-lg bg-white/90 p-2 hover:bg-white",
                  allowedContent: "hidden",
                }}
                content={{
                  button() {
                    return <Camera size={20} className="text-midnight" />;
                  },
                }}
              />
            )}
          </div>
        </div>
        <div>
          <h2 className="text-midnight text-xl font-bold">
            {initialData.name}
          </h2>
          <p className="text-midnight/50">تغيير الصورة الشخصية</p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="text-midnight mb-2 block text-sm font-medium">
          نبذة عنك
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="أخبرنا عن نفسك..."
          className="premium-input text-midnight placeholder:text-midnight/40 w-full resize-none rounded-xl bg-white/60 px-4 py-3 focus:outline-none"
          rows={3}
          maxLength={500}
        />
        <p className="text-midnight/40 mt-1 text-left text-xs">
          {bio.length}/500
        </p>
      </div>

      {/* Location */}
      <div>
        <label className="text-midnight mb-2 block text-sm font-medium">
          الموقع
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="الخرطوم، السودان"
          className="premium-input text-midnight placeholder:text-midnight/40 w-full rounded-xl bg-white/60 px-4 py-3 focus:outline-none"
          maxLength={256}
        />
      </div>

      {/* Website */}
      <div>
        <label className="text-midnight mb-2 block text-sm font-medium">
          الموقع الإلكتروني
        </label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          className="premium-input text-midnight placeholder:text-midnight/40 w-full rounded-xl bg-white/60 px-4 py-3 focus:outline-none"
          maxLength={512}
          dir="ltr"
        />
      </div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        disabled={isSaving}
        className="shimmer-btn text-midnight flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all disabled:opacity-50"
        whileHover={!isSaving ? { scale: 1.01 } : {}}
        whileTap={!isSaving ? { scale: 0.99 } : {}}
      >
        {isSaving ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Save size={20} />
        )}
        <span>حفظ التغييرات</span>
      </motion.button>
    </div>
  );
}
