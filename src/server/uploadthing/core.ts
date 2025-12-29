import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // General image uploader (legacy/survey)
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload complete:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // Post media uploader (images and videos for social posts)
  postMedia: f({
    image: {
      maxFileSize: "16MB",
      maxFileCount: 4,
    },
    video: {
      maxFileSize: "64MB",
      maxFileCount: 2,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Post media upload complete:", file.ufsUrl);
    return { url: file.ufsUrl, type: file.type.startsWith("video") ? "video" : "image" };
  }),

  // Avatar uploader
  avatarUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Avatar upload complete:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // Cover image uploader
  coverUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Cover upload complete:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

