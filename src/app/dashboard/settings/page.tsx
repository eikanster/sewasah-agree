"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAppUser } from "@/hooks/use-app-user";
import { Id } from "@convex/_generated/dataModel";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  firm_owner:  "Pemilik Firma",
  lawyer:      "Peguam",
  admin:       "Admin",
  user:        "Menunggu Peruntukan",
};

const ROLE_COLORS: Record<string, { bg: string; fg: string }> = {
  super_admin: { bg: "oklch(0.55 0.14 40 / 0.10)", fg: "oklch(0.42 0.12 40)" },
  firm_owner:  { bg: "oklch(0.55 0.14 40 / 0.10)", fg: "oklch(0.42 0.12 40)" },
  lawyer:      { bg: "oklch(0.910 0.050 292)",      fg: "oklch(0.36 0.105 292)" },
  admin:       { bg: "oklch(0.938 0.002 264)",       fg: "oklch(0.38 0.003 264)" },
  user:        { bg: "oklch(0.930 0.065 72)",        fg: "oklch(0.38 0.120 65)" },
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.28 0.003 264)" }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid oklch(0.876 0.003 264)",
  borderRadius: "10px", fontSize: "0.9375rem",
  color: "oklch(0.09 0.006 264)", background: "oklch(0.998 0 0)",
  outline: "none", transition: "border-color 150ms ease-out, box-shadow 150ms ease-out",
  boxSizing: "border-box",
};

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? "oklch(0.55 0.14 40)" : "oklch(0.876 0.003 264)",
        boxShadow: focused ? "0 0 0 3px oklch(0.55 0.14 40 / 0.12)" : "none",
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

export default function SettingsPage() {
  const { appUser } = useAppUser();
  const firm = useQuery(api.firms.getById, appUser?.firmId ? { id: appUser.firmId } : "skip");
  const users = useQuery(api.users.listByFirm, appUser?.firmId ? { firmId: appUser.firmId } : "skip");
  const updateFirm = useMutation(api.firms.update);
  const updateRole = useMutation(api.users.updateRole);
  const regenCode = useMutation(api.firms.regenerateInviteCode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [regenLoading, setRegenLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (firm?.inviteCode) {
      navigator.clipboard.writeText(firm.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenCode = async () => {
    if (!appUser?.firmId) {
      console.error("No firmId found:", appUser);
      return;
    }
    setRegenLoading(true);
    try {
      await regenCode({ id: appUser.firmId });
    } catch (e) {
      console.error("Regen failed:", e);
    }
    setRegenLoading(false);
  };

  const canManageUsers = appUser?.role === "super_admin" || appUser?.role === "firm_owner";

  const handleRoleChange = async (userId: Id<"users">, role: "super_admin" | "firm_owner" | "lawyer" | "admin" | "user") => {
    setUpdatingRole(userId);
    await updateRole({ id: userId, role });
    setUpdatingRole(null);
  };

  const [form, setForm] = useState({
    name: "", address: "", phone: "", email: "",
    lawyerName: "", barNo: "",
  });

  useEffect(() => {
    if (firm) {
      setForm({
        name:       firm.name       ?? "",
        address:    firm.address    ?? "",
        phone:      firm.phone      ?? "",
        email:      firm.email      ?? "",
        lawyerName: firm.lawyerName ?? "",
        barNo:      firm.barNo      ?? "",
      });
    }
  }, [firm]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!appUser?.firmId) return;
    setSaving(true);
    await updateFirm({
      id: appUser.firmId,
      name:       form.name       || undefined,
      address:    form.address    || undefined,
      phone:      form.phone      || undefined,
      email:      form.email      || undefined,
      lawyerName: form.lawyerName || undefined,
      barNo:      form.barNo      || undefined,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!firm) return (
    <div style={{ color: "oklch(0.56 0.003 264)", fontSize: "0.875rem" }}>Memuatkan...</div>
  );

  return (
    <div style={{ maxWidth: "640px" }} className="page-enter">

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "6px" }}>
          Tetapan
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em",
          color: "oklch(0.09 0.006 264)", margin: 0 }}>
          Maklumat Firma
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "oklch(0.50 0.003 264)", marginTop: "6px" }}>
          Maklumat ini akan dipaparkan dalam pengepala dokumen perjanjian.
        </p>
      </div>

      {/* Firm Details */}
      <div style={{
        background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "18px", overflow: "hidden",
        boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05)", marginBottom: "16px",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid oklch(0.895 0.002 264)",
          background: "oklch(0.963 0.002 264)" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>
            Maklumat Firma
          </p>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field label="Nama Firma *" hint="Contoh: Syairus Rohan & Associates">
            <Input value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="cth. Syairus Rohan & Associates" />
          </Field>
          <Field label="Alamat Firma" hint="Alamat pejabat yang akan dipaparkan dalam dokumen">
            <Input value={form.address} onChange={e => set("address", e.target.value)}
              placeholder="cth. Suite 12-3, Menara ABC, Jalan Ampang, 50450 Kuala Lumpur" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="No. Telefon">
              <Input value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="cth. 03-2123 4567" />
            </Field>
            <Field label="E-mel Firma">
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="cth. info@firma.com.my" />
            </Field>
          </div>
        </div>
      </div>

      {/* Lawyer Details */}
      <div style={{
        background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "18px", overflow: "hidden",
        boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05)", marginBottom: "24px",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid oklch(0.895 0.002 264)",
          background: "oklch(0.963 0.002 264)" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>
            Maklumat Peguam
          </p>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field label="Nama Peguam" hint="Nama penuh seperti dalam kad undi peguam">
            <Input value={form.lawyerName} onChange={e => set("lawyerName", e.target.value)}
              placeholder="cth. Syairus Rohan bin Mohd Noor" />
          </Field>
          <Field label="No. Bar / Nombor Keahlian" hint="Nombor pendaftaran Majlis Peguam Malaysia">
            <Input value={form.barNo} onChange={e => set("barNo", e.target.value)}
              placeholder="cth. B-12345" />
          </Field>
        </div>
      </div>

      {/* Users & Roles — super_admin only */}
      {canManageUsers && (
        <div style={{
          background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
          borderRadius: "18px", overflow: "hidden",
          boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05)", marginBottom: "16px",
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid oklch(0.895 0.002 264)",
            background: "oklch(0.963 0.002 264)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>
              Pengurusan Pengguna
            </p>
            <span style={{ fontSize: "0.6875rem", color: "oklch(0.56 0.003 264)" }}>
              {users?.length ?? 0} pengguna
            </span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {users?.map(u => {
              const colors = ROLE_COLORS[u.role] ?? ROLE_COLORS.admin;
              const isMe = u._id === appUser?._id;
              return (
                <div key={u._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 24px",
                  borderBottom: "1px solid oklch(0.938 0.002 264)",
                }}>
                  <div>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "oklch(0.09 0.006 264)", margin: 0 }}>
                      {u.name} {isMe && <span style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", fontWeight: 400 }}>(anda)</span>}
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", margin: "2px 0 0" }}>
                      {u.email}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {updatingRole === u._id ? (
                      <span style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)" }}>Menyimpan...</span>
                    ) : (
                      <select
                        value={u.role}
                        disabled={isMe}
                        onChange={e => handleRoleChange(u._id, e.target.value as "super_admin" | "firm_owner" | "lawyer" | "admin" | "user")}
                        style={{
                          padding: "5px 28px 5px 10px", borderRadius: "8px",
                          border: `1px solid ${colors.bg}`,
                          background: colors.bg, color: colors.fg,
                          fontSize: "0.8125rem", fontWeight: 600,
                          cursor: isMe ? "not-allowed" : "pointer",
                          outline: "none", appearance: "none",
                          backgroundImage: isMe ? "none" : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                          opacity: isMe ? 0.7 : 1,
                        }}
                      >
                        <option value="firm_owner">Pemilik Firma</option>
                        <option value="lawyer">Peguam</option>
                        <option value="admin">Admin</option>
                        <option value="user">Menunggu Peruntukan</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
            {(!users || users.length === 0) && (
              <p style={{ padding: "20px 24px", fontSize: "0.875rem", color: "oklch(0.56 0.003 264)" }}>
                Tiada pengguna lain dalam firma ini.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Invite Code */}
      <div style={{
        background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "18px", overflow: "hidden",
        boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05)", marginBottom: "16px",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid oklch(0.895 0.002 264)", background: "oklch(0.963 0.002 264)" }}>
          <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "oklch(0.09 0.006 264)", margin: 0 }}>
            Kod Jemputan Firma
          </p>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", margin: "0 0 12px", lineHeight: 1.5 }}>
            Kongsi kod ini kepada kakitangan atau peguam yang ingin menyertai firma anda.
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "oklch(0.963 0.002 264)", border: "1px solid oklch(0.876 0.003 264)",
            borderRadius: "10px", padding: "12px 16px",
          }}>
            <code style={{ flex: 1, fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.55 0.14 40)", fontFamily: "monospace", letterSpacing: "0.1em" }}>
              {firm?.inviteCode ?? "—"}
            </code>
            <button onClick={handleCopyCode} style={{ background: copied ? "oklch(0.55 0.14 40)" : "none", color: copied ? "oklch(0.998 0 0)" : "oklch(0.44 0.003 264)", border: "1px solid oklch(0.876 0.003 264)", borderRadius: "8px", padding: "5px 12px", fontSize: "0.8125rem", cursor: "pointer", transition: "all 150ms ease-out" }}>
              {copied ? "✓ Disalin" : "Salin"}
            </button>
            <button onClick={handleRegenCode} disabled={regenLoading} style={{ background: "none", border: "1px solid oklch(0.876 0.003 264)", borderRadius: "8px", padding: "5px 12px", fontSize: "0.8125rem", cursor: regenLoading ? "not-allowed" : "pointer", color: "oklch(0.44 0.003 264)", transition: "all 150ms ease-out" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.48 0.18 27)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.48 0.18 27)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.876 0.003 264)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.44 0.003 264)"; }}>
              {regenLoading ? "..." : "Jana Semula"}
            </button>
          </div>
          <p style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", margin: "8px 0 0" }}>
            Klik "Jana Semula" jika kod ini telah dikongsi secara tidak sengaja. Kod lama tidak akan berfungsi.
          </p>
        </div>
      </div>

      {/* PDF Preview Note */}
      <div style={{
        padding: "16px 20px", borderRadius: "12px",
        background: "oklch(0.55 0.14 40 / 0.06)",
        border: "1px solid oklch(0.55 0.14 40 / 0.20)",
        marginBottom: "24px",
      }}>
        <p style={{ fontSize: "0.8125rem", color: "oklch(0.38 0.08 40)", margin: 0, lineHeight: 1.6 }}>
          <strong>Nota:</strong> Nama firma, alamat, nama peguam dan nombor bar akan dipaparkan dalam pengepala setiap dokumen perjanjian yang dijana. Pastikan maklumat ini tepat sebelum menghantar dokumen kepada klien.
        </p>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-brand"
          style={{ padding: "12px 32px" }}
        >
          {saving ? "Menyimpan..." : "Simpan Tetapan"}
        </button>
        {saved && (
          <span style={{
            fontSize: "0.875rem", fontWeight: 500,
            color: "oklch(0.35 0.10 148)",
            animation: "pageIn 200ms ease-out both",
          }}>
            ✓ Tersimpan
          </span>
        )}
      </div>

    </div>
  );
}
