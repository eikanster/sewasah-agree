import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get firm by ID
export const getById = query({
  args: { id: v.id("firms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all firms (super admin only)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("firms").collect();
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
