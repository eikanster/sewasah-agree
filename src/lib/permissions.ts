// Central permissions map — update here when roles change, nowhere else

export type AppRole = "super_admin" | "firm_owner" | "lawyer" | "admin" | "user";

export const PERMISSIONS = {
  // Nav items visible
  canViewDashboard:    (r: AppRole) => r !== "user",
  canCreateAgreement:  (r: AppRole) => ["super_admin", "firm_owner", "admin"].includes(r),
  canReviewAgreements: (r: AppRole) => ["super_admin", "firm_owner", "lawyer"].includes(r),
  canViewSettings:     (r: AppRole) => ["super_admin", "firm_owner"].includes(r),
  canManageUsers:      (r: AppRole) => ["super_admin", "firm_owner"].includes(r),

  // Page-level access
  canAccessAgreement:  (r: AppRole) => r !== "user",
  canAccessStamp:      (r: AppRole) => ["super_admin", "firm_owner", "lawyer"].includes(r),
} as const;

export function roleLabel(r: AppRole): string {
  const labels: Record<AppRole, string> = {
    super_admin: "Super Admin",
    firm_owner:  "Pemilik Firma",
    lawyer:      "Peguam",
    admin:       "Admin",
    user:        "Menunggu Peruntukan",
  };
  return labels[r] ?? r;
}
