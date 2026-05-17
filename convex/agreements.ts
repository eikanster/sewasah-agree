import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all agreements for a firm
export const listByFirm = query({
  args: { firmId: v.id("firms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agreements")
      .withIndex("by_firm", (q) => q.eq("firmId", args.firmId))
      .order("desc")
      .collect();
  },
});

// Get single agreement
export const getById = query({
  args: { id: v.id("agreements") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get agreements pending lawyer review
export const listPendingReview = query({
  args: { firmId: v.id("firms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agreements")
      .withIndex("by_firm_and_status", (q) =>
        q.eq("firmId", args.firmId).eq("status", "pending_review")
      )
      .collect();
  },
});

// Dashboard counts
export const getDashboardCounts = query({
  args: { firmId: v.id("firms") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("agreements")
      .withIndex("by_firm", (q) => q.eq("firmId", args.firmId))
      .collect();

    return {
      pendingReview: all.filter((a) => a.status === "pending_review").length,
      pendingStamp: all.filter((a) => a.status === "pending_stamp").length,
      completed: all.filter((a) => a.status === "completed").length,
      totalThisMonth: all.filter((a) => {
        const date = new Date(a.createdAt);
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }).length,
    };
  },
});

// Create new agreement
export const create = mutation({
  args: {
    firmId: v.id("firms"),
    createdBy: v.id("users"),
    landlordName: v.string(),
    landlordIc: v.string(),
    landlordPhone: v.string(),
    landlordEmail: v.optional(v.string()),
    landlordAddress: v.string(),
    tenantName: v.string(),
    tenantIc: v.string(),
    tenantPhone: v.string(),
    tenantEmail: v.optional(v.string()),
    tenantAddress: v.string(),
    tenantIsForeigner: v.boolean(),
    propertyAddress: v.string(),
    propertyType: v.union(
      v.literal("apartment"),
      v.literal("landed"),
      v.literal("room"),
      v.literal("commercial")
    ),
    useOfPremises: v.union(v.literal("residential"), v.literal("commercial")),
    isFurnished: v.union(
      v.literal("furnished"),
      v.literal("partially"),
      v.literal("unfurnished")
    ),
    monthlyRent: v.number(),
    tenancyDuration: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    paymentDueDay: v.number(),
    securityDeposit: v.number(),
    utilitiesDeposit: v.number(),
    petsAllowed: v.boolean(),
    sublettingAllowed: v.boolean(),
    renovationAllowed: v.boolean(),
    airconUnits: v.number(),
    bankName: v.string(),
    bankAccountNo: v.string(),
    bankAccountName: v.string(),
    stampDuty: v.number(),
    aiFlags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("agreements")
      .withIndex("by_firm", (q) => q.eq("firmId", args.firmId))
      .collect();
    const year = new Date().getFullYear();
    const agreementRef = `SA-${year}-${String(existing.length + 1).padStart(4, "0")}`;
    return await ctx.db.insert("agreements", {
      ...args,
      agreementRef,
      status: "draft",
      renewalReminderSent: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update status
export const updateStatus = mutation({
  args: {
    id: v.id("agreements"),
    status: v.union(
      v.literal("draft"),
      v.literal("pending_review"),
      v.literal("changes_requested"),
      v.literal("approved"),
      v.literal("pending_stamp"),
      v.literal("stamped"),
      v.literal("completed")
    ),
    lawyerNotes: v.optional(v.string()),
    approvedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      approvedAt: args.status === "approved" ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
  },
});

// Update PDF URLs after generation/stamping
export const updatePdfUrl = mutation({
  args: {
    id: v.id("agreements"),
    draftPdfUrl: v.optional(v.string()),
    stampedPdfUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});
