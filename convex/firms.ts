import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get firm by ID
export const getById = query({
  args: { id: v.id("firms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get the first active firm (used for auto-registration of new users)
export const getFirst = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("firms").filter(q => q.eq(q.field("isActive"), true)).first();
  },
});

// Get all firms (super admin only)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("firms").collect();
  },
});

// Get all firms with stats (super admin dashboard)
export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const firms = await ctx.db.query("firms").collect();
    const results = await Promise.all(firms.map(async (firm) => {
      const agreements = await ctx.db
        .query("agreements")
        .withIndex("by_firm", q => q.eq("firmId", firm._id))
        .collect();
      const users = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("firmId"), firm._id))
        .collect();
      const lastAgreement = agreements.sort((a, b) => b.createdAt - a.createdAt)[0];
      return {
        ...firm,
        totalAgreements: agreements.length,
        completedAgreements: agreements.filter(a => a.status === "completed").length,
        pendingReview: agreements.filter(a => a.status === "pending_review").length,
        totalUsers: users.length,
        lastActivity: lastAgreement?.createdAt ?? firm.createdAt,
      };
    }));
    return results.sort((a, b) => b.lastActivity - a.lastActivity);
  },
});

// Update firm settings
export const update = mutation({
  args: {
    id: v.id("firms"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    lawyerName: v.optional(v.string()),
    barNo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Toggle firm active/inactive (super_admin only — never hard delete)
export const toggleActive = mutation({
  args: { id: v.id("firms") },
  handler: async (ctx, args) => {
    const firm = await ctx.db.get(args.id);
    if (!firm) throw new Error("Firm not found");
    await ctx.db.patch(args.id, { isActive: !firm.isActive });
  },
});

// Create a new firm
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("firms", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});
