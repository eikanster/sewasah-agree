import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Law firms (each firm = one Sewasah Agree instance)
  firms: defineTable({
    name: v.string(),
    slug: v.string(), // e.g. "razak-associates"
    logoUrl: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }),

  // Users (admin staff + lawyers, linked to Clerk user ID)
  users: defineTable({
    clerkId: v.string(),
    firmId: v.id("firms"),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("super_admin"),  // You (Sewasah owner)
      v.literal("lawyer"),       // Lawyer who approves
      v.literal("admin")         // Office staff who creates agreements
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // Tenancy agreements
  agreements: defineTable({
    firmId: v.id("firms"),
    createdBy: v.id("users"),

    // Status flow
    status: v.union(
      v.literal("draft"),           // Admin filling form
      v.literal("pending_review"),  // Sent to lawyer
      v.literal("changes_requested"), // Lawyer wants edits
      v.literal("approved"),        // Lawyer approved
      v.literal("pending_stamp"),   // Awaiting myStamps
      v.literal("stamped"),         // Stamped, ready to deliver
      v.literal("completed")        // Delivered to all parties
    ),

    // Agreement reference
    agreementRef: v.string(), // e.g. SA-2026-0001

    // Landlord details
    landlordName: v.string(),
    landlordIc: v.string(),
    landlordPhone: v.string(),
    landlordEmail: v.optional(v.string()),
    landlordAddress: v.string(),

    // Tenant details
    tenantName: v.string(),
    tenantIc: v.string(),
    tenantPhone: v.string(),
    tenantEmail: v.optional(v.string()),
    tenantAddress: v.string(),
    tenantIsForeigner: v.boolean(),

    // Property details
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

    // Agreement terms
    monthlyRent: v.number(),
    tenancyDuration: v.number(), // in months
    startDate: v.string(),
    endDate: v.string(),
    paymentDueDay: v.number(), // e.g. 6
    securityDeposit: v.number(),
    utilitiesDeposit: v.number(),

    // Special conditions
    petsAllowed: v.boolean(),
    sublettingAllowed: v.boolean(),
    renovationAllowed: v.boolean(),
    airconUnits: v.number(),

    // Bank details
    bankName: v.string(),
    bankAccountNo: v.string(),
    bankAccountName: v.string(),

    // Calculated fields
    stampDuty: v.number(),

    // AI flags for lawyer
    aiFlags: v.array(v.string()),

    // File URLs
    draftPdfUrl: v.optional(v.string()),
    stampedPdfUrl: v.optional(v.string()),

    // Lawyer notes
    lawyerNotes: v.optional(v.string()),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),

    // Renewal
    renewalReminderSent: v.boolean(),
    renewalDueDate: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_firm", ["firmId"])
    .index("by_status", ["status"])
    .index("by_firm_and_status", ["firmId", "status"]),
});
