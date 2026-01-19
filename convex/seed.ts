import { mutation } from "./_generated/server";

export const seedAI = mutation({
  args: {},
  handler: async (ctx) => {
    const email = "ai@ee37.platform";
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!existingUser) {
      await ctx.db.insert("users", {
        name: "خديجة الرسام",
        email: email,
        collegeId: "AI-BOT",
        password: "hashed_placeholder",
        isAdmin: true,
        emailVerified: true,
        bio: "المساعد الذكي للدفعة 37",
        createdAt: Date.now(),
      });
      return "AI user created";
    }

    return "AI user already exists";
  },
});
