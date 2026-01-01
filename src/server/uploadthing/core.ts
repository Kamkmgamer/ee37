import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Semester 1 uploader
  semester1Uploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Semester 1 upload complete:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // Semester 2 uploader
  semester2Uploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Semester 2 upload complete:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // Semester 3 uploader
  semester3Uploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Semester 3 upload complete:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // Semester 4 uploader
  semester4Uploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Semester 4 upload complete:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // Semester 5 uploader
  semester5Uploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Semester 5 upload complete:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // General image uploader (legacy/survey without semester)
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
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
    return {
      url: file.ufsUrl,
      type: file.type.startsWith("video") ? "video" : "image",
    };
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
