import { createTRPCRouter } from "~/server/api/trpc";
import { adminDashboardRouter } from "./dashboard";
import { adminUsersRouter } from "./users";
import { adminContentRouter } from "./content";
import { adminReportsRouter } from "./reports";
import { adminLearningRouter } from "./learning";
import { adminAuditRouter } from "./audit";
import { adminAnnouncementsRouter } from "./announcements";

export const adminRouter = createTRPCRouter({
  dashboard: adminDashboardRouter,
  users: adminUsersRouter,
  content: adminContentRouter,
  reports: adminReportsRouter,
  learning: adminLearningRouter,
  audit: adminAuditRouter,
  announcements: adminAnnouncementsRouter,
});
