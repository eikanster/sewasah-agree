import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ROLE = v.union(
  v.literal("super_admin"),
  v.literal("firm_owner"),
  v.literal("lawyer"),
  v.literal("admin"),
  v.literal("user")
);

// Get current user by Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// List all users for a firm
export const listByFirm = query({
  args: { firmId: v.id("firms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("firmId"), args.firmId))
      .collect();
  },
});

// Update user role (firm_owner / super_admin only)
export const updateRole = mutation({
  args: { id: v.id("users"), role: ROLE },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
  },
});

// Create firm owner (first signup — creates firm)
export const upsert = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    firmId: v.id("firms"),
    role: ROLE,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { name: args.name, email: args.email });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

// Auto-register new user onto existing firm as "user" (pending assignment)
export const autoRegister = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    firmId: v.id("firms"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      ...args,
      role: "user",
      isActive: true,
      createdAt: Date.now(),
    });
  },
});
