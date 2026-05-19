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
    lawyerName: v.optional(v.string()),
    barNo: v.optional(v.string()),
    inviteCode: v.optional(v.string()),
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
      v.literal("super_admin"),  // Sewasah platform owner
      v.literal("firm_owner"),   // Created the firm, manages users
      v.literal("lawyer"),       // Reviews and approves agreements
      v.literal("admin"),        // Creates agreements (office staff)
      v.literal("user")          // Default — pending role assignment
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

    // Agreement reference (optional for old records)
    agreementRef: v.optional(v.string()),

    // Agreement type (optional for old records)
    agreementType: v.optional(v.union(
      v.literal("residential"),
      v.literal("room"),
      v.literal("short_term"),
      v.literal("commercial")
    )),

    // Room rental extras
    roomIdentifier: v.optional(v.string()),       // e.g. "Master Bedroom"
    utilitiesHandling: v.optional(v.string()),    // "split" | "landlord" | "submeter"
    wifiIncluded: v.optional(v.boolean()),        // wifi free
    waterIncluded: v.optional(v.boolean()),       // landlord pays water
    latePaymentInterest: v.optional(v.number()), // % per month e.g. 1.5
    meterReading: v.optional(v.string()),         // electricity meter at commencement
    rentFreePeriod: v.optional(v.number()),       // days of rent-free period

    // Short-term extras
    utilitiesIncluded: v.optional(v.boolean()),   // rent includes utilities

    // Landlord details
    landlordName: v.string(),
    landlordIc: v.string(),
    landlordPhone: v.string(),
    landlordEmail: v.optional(v.string()),
    landlordAddress: v.optional(v.string()),

    // Tenant details
    tenantName: v.string(),
    tenantIc: v.string(),
    tenantPhone: v.string(),
    tenantEmail: v.optional(v.string()),
    tenantAddress: v.optional(v.string()),
    tenantIsForeigner: v.boolean(),

    // Property details
    propertyAddress: v.string(),
    propertyType: v.union(
      v.literal("apartment"),
      v.literal("landed"),
      v.literal("room"),
      v.literal("commercial")
    ),
    useOfPremises: v.optional(v.union(v.literal("residential"), v.literal("commercial"))),
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

    // Optional property legal description (title, lot, mukim, daerah)
    propertyLegalDesc: v.optional(v.string()),

    // Bank details
    bankName: v.string(),
    bankAccountNo: v.string(),
    bankAccountName: v.string(),

    // Optional maintenance fee (condos etc.)
    maintenanceFee: v.optional(v.number()),

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
