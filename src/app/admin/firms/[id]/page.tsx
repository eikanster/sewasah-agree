"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

type Tab = "overview" | "agreements" | "users" | "settings";

const STATUS_MAP: Record<string, { label: string; bg: string; fg: string }> = {
  draft:             { label: "Draf",           bg: "oklch(0.938 0.002 264)", fg: "oklch(0.38 0.003 264)"  },
  pending_review:    { label: "Menunggu Semak", bg: "oklch(0.930 0.065 72)",  fg: "oklch(0.38 0.120 65)"  },
  changes_requested: { label: "Perlu Pindaan",  bg: "oklch(0.93 0.06 27)",   fg: "oklch(0.38 0.12 27)"   },
  approved:          { label: "Diluluskan",     bg: "oklch(0.900 0.068 148)", fg: "oklch(0.30 0.100 148)" },
  pending_stamp:     { label: "Tunggu Setem",   bg: "oklch(0.910 0.050 292)", fg: "oklch(0.36 0.105 292)" },
  stamped:           { label: "Disetem",        bg: "oklch(0.900 0.068 148)", fg: "oklch(0.30 0.100 148)" },
  completed:         { label: "Selesai",        bg: "oklch(0.380 0.090 148)", fg: "oklch(0.970 0.008 58)" },
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin", firm_owner: "Pemilik Firma",
  lawyer: "Peguam", admin: "Admin", user: "Menunggu",
};

const ROLE_COLORS: Record<string, { bg: string; fg: string }> = {
  super_admin: { bg: "oklch(0.55 0.14 40 / 0.10)", fg: "oklch(0.42 0.12 40)"  },
  firm_owner:  { bg: "oklch(0.55 0.14 40 / 0.10)", fg: "oklch(0.42 0.12 40)"  },
  lawyer:      { bg: "oklch(0.910 0.050 292)",      fg: "oklch(0.36 0.105 292)" },
  admin:       { bg: "oklch(0.938 0.002 264)",       fg: "oklch(0.38 0.003 264)" },
  user:        { bg: "oklch(0.930 0.065 72)",        fg: "oklch(0.38 0.120 65)"  },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "baru sahaja";
  if (mins < 60) return `${mins} minit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
      borderRadius: "16px", overflow: "hidden",
      boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.04)",
    }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid oklch(0.895 0.002 264)", background: "oklch(0.963 0.002 264)" }}>
        <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "oklch(0.09 0.006 264)", margin: 0 }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid oklch(0.938 0.002 264)" }}>
      <span style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)" }}>{label}</span>
      <span style={{ fontSize: "0.875rem", color: value ? "oklch(0.09 0.006 264)" : "oklch(0.70 0.003 264)", fontWeight: value ? 500 : 400 }}>
        {value || "—"}
      </span>
    </div>
  );
}

export default function FirmDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

  const firmId = id as Id<"firms">;
  const firm = useQuery(api.firms.getById, { id: firmId });
  const agreements = useQuery(api.agreements.listByFirm, { firmId });
  const users = useQuery(api.users.listByFirm, { firmId });

  const updateFirm = useMutation(api.firms.update);
  const toggleActive = useMutation(api.firms.toggleActive);
  const updateRole = useMutation(api.users.updateRole);

  if (!firm) return (
    <div style={{ padding: "48px", textAlign: "center", color: "oklch(0.56 0.003 264)" }}>Memuatkan...</div>
  );

  const completedCount = agreements?.filter(a => a.status === "completed").length ?? 0;
  const pendingCount   = agreements?.filter(a => a.status === "pending_review").length ?? 0;
  const revenue        = completedCount * 40;

  const handleToggleActive = async () => {
    await toggleActive({ id: firmId });
    setDeactivateConfirm(false);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    await updateFirm({ id: firmId, name: editName.trim() });
    setSaving(false);
    setEditing(false);
  };

  const handleRoleChange = async (userId: Id<"users">, role: string) => {
    setRoleUpdating(userId);
    await updateRole({ id: userId, role: role as "super_admin" | "firm_owner" | "lawyer" | "admin" | "user" });
    setRoleUpdating(null);
  };

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "overview",    label: "Gambaran"    },
    { key: "agreements",  label: "Perjanjian", count: agreements?.length },
    { key: "users",       label: "Pengguna",   count: users?.length },
    { key: "settings",    label: "Tetapan"     },
  ];

  return (
    <div style={{ maxWidth: "960px" }} className="page-enter">

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <button onClick={() => router.push("/admin")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "0.875rem", color: "oklch(0.55 0.14 40)", fontWeight: 500, padding: 0,
        }}>← Semua Firma</button>
        <span style={{ color: "oklch(0.70 0.003 264)" }}>/</span>
        <span style={{ fontSize: "0.875rem", color: "oklch(0.56 0.003 264)" }}>{firm.name}</span>
      </div>

      {/* Firm Header */}
      <div style={{
        background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "18px", padding: "28px 32px", marginBottom: "24px",
        boxShadow: "0 1px 4px oklch(0.12 0.006 264 / 0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Avatar */}
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: firm.isActive ? "oklch(0.55 0.14 40)" : "oklch(0.70 0.003 264)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.125rem", fontWeight: 800, color: "oklch(0.998 0 0)",
              flexShrink: 0,
            }}>
              {firm.name.slice(0, 2).toUpperCase()}
            </div>

            <div>
              {/* Firm name — editable */}
              {editing ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSaveName()}
                    autoFocus
                    style={{
                      fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.02em",
                      border: "1.5px solid oklch(0.55 0.14 40)", borderRadius: "8px",
                      padding: "4px 10px", color: "oklch(0.09 0.006 264)",
                      background: "oklch(0.998 0 0)", outline: "none",
                    }}
                  />
                  <button onClick={handleSaveName} disabled={saving} style={{
                    background: "oklch(0.55 0.14 40)", color: "oklch(0.998 0 0)",
                    border: "none", borderRadius: "8px", padding: "6px 14px",
                    fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
                  }}>{saving ? "..." : "Simpan"}</button>
                  <button onClick={() => setEditing(false)} style={{
                    background: "none", border: "1px solid oklch(0.876 0.003 264)",
                    borderRadius: "8px", padding: "6px 12px",
                    fontSize: "0.8125rem", cursor: "pointer", color: "oklch(0.56 0.003 264)",
                  }}>Batal</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h1 style={{ fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.02em", color: "oklch(0.09 0.006 264)", margin: 0 }}>
                    {firm.name}
                  </h1>
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.06em",
                    textTransform: "uppercase", padding: "3px 10px", borderRadius: "999px",
                    background: firm.isActive ? "oklch(0.900 0.068 148)" : "oklch(0.938 0.002 264)",
                    color: firm.isActive ? "oklch(0.30 0.100 148)" : "oklch(0.44 0.003 264)",
                  }}>
                    {firm.isActive ? "● Aktif" : "○ Tidak Aktif"}
                  </span>
                </div>
              )}

              <p style={{ fontSize: "0.875rem", color: "oklch(0.56 0.003 264)", margin: "4px 0 0" }}>
                {firm.email ?? "Tiada e-mel"} {firm.phone ? `· ${firm.phone}` : ""}
              </p>
            </div>
          </div>

          {/* Actions */}
          {!editing && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => { setEditing(true); setEditName(firm.name); }} style={{
                background: "none", border: "1px solid oklch(0.876 0.003 264)",
                borderRadius: "10px", padding: "8px 16px", fontSize: "0.875rem",
                fontWeight: 500, cursor: "pointer", color: "oklch(0.42 0.003 264)",
                transition: "all 150ms ease-out",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.14 40)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.876 0.003 264)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.42 0.003 264)"; }}>
                ✏️ Edit Nama
              </button>

              {/* Deactivate / Activate */}
              {deactivateConfirm ? (
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)" }}>
                    {firm.isActive ? "Nyahaktifkan firma ini?" : "Aktifkan semula?"}
                  </span>
                  <button onClick={handleToggleActive} style={{
                    background: firm.isActive ? "oklch(0.48 0.18 27)" : "oklch(0.42 0.09 145)",
                    color: "oklch(0.998 0 0)", border: "none",
                    borderRadius: "8px", padding: "7px 14px",
                    fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
                  }}>Ya, {firm.isActive ? "Nyahaktifkan" : "Aktifkan"}</button>
                  <button onClick={() => setDeactivateConfirm(false)} style={{
                    background: "none", border: "1px solid oklch(0.876 0.003 264)",
                    borderRadius: "8px", padding: "7px 12px",
                    fontSize: "0.8125rem", cursor: "pointer", color: "oklch(0.56 0.003 264)",
                  }}>Batal</button>
                </div>
              ) : (
                <button onClick={() => setDeactivateConfirm(true)} style={{
                  background: firm.isActive ? "oklch(0.48 0.18 27 / 0.08)" : "oklch(0.42 0.09 145 / 0.08)",
                  color: firm.isActive ? "oklch(0.48 0.18 27)" : "oklch(0.35 0.10 148)",
                  border: `1px solid ${firm.isActive ? "oklch(0.48 0.18 27 / 0.3)" : "oklch(0.42 0.09 145 / 0.3)"}`,
                  borderRadius: "10px", padding: "8px 16px", fontSize: "0.875rem",
                  fontWeight: 500, cursor: "pointer", transition: "all 150ms ease-out",
                }}>
                  {firm.isActive ? "🔴 Nyahaktifkan" : "🟢 Aktifkan Semula"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Key metrics strip */}
        <div style={{ display: "flex", gap: "24px", paddingTop: "16px", borderTop: "1px solid oklch(0.938 0.002 264)" }}>
          {[
            { label: "Perjanjian",  value: agreements?.length ?? 0 },
            { label: "Selesai",     value: completedCount },
            { label: "Menunggu",    value: pendingCount },
            { label: "Pengguna",    value: users?.length ?? 0 },
            { label: "Pendapatan",  value: `RM ${revenue.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "oklch(0.09 0.006 264)", margin: 0, letterSpacing: "-0.02em" }}>
                {value}
              </p>
              <p style={{ fontSize: "0.6875rem", color: "oklch(0.56 0.003 264)", margin: "2px 0 0", fontWeight: 500 }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", marginBottom: "20px", background: "oklch(0.963 0.002 264)", borderRadius: "12px", padding: "4px" }}>
        {TABS.map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: "8px 16px", borderRadius: "9px",
            border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500,
            background: tab === key ? "oklch(0.998 0 0)" : "transparent",
            color: tab === key ? "oklch(0.09 0.006 264)" : "oklch(0.56 0.003 264)",
            boxShadow: tab === key ? "0 1px 3px oklch(0.12 0.006 264 / 0.08)" : "none",
            transition: "all 150ms ease-out",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            {label}
            {count !== undefined && (
              <span style={{
                fontSize: "0.6875rem", fontWeight: 700,
                background: tab === key ? "oklch(0.938 0.002 264)" : "oklch(0.876 0.003 264)",
                color: "oklch(0.44 0.003 264)",
                padding: "1px 6px", borderRadius: "999px",
              }}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Section title="Maklumat Firma">
            <InfoRow label="Nama Firma"   value={firm.name} />
            <InfoRow label="E-mel"        value={firm.email} />
            <InfoRow label="Telefon"      value={firm.phone} />
            <InfoRow label="Alamat"       value={firm.address} />
            <InfoRow label="Status"       value={firm.isActive ? "Aktif" : "Tidak Aktif"} />
          </Section>
          <Section title="Maklumat Peguam">
            <InfoRow label="Nama Peguam"  value={firm.lawyerName} />
            <InfoRow label="No. Bar"      value={firm.barNo} />
            <div style={{ padding: "16px 24px" }}>
              <p style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>
                Maklumat peguam diisi oleh pemilik firma dalam Tetapan mereka.
              </p>
            </div>
          </Section>
          <Section title="Ringkasan Aktiviti">
            <InfoRow label="Jumlah Perjanjian"   value={String(agreements?.length ?? 0)} />
            <InfoRow label="Selesai"             value={String(completedCount)} />
            <InfoRow label="Menunggu Semakan"    value={String(pendingCount)} />
            <InfoRow label="Anggaran Pendapatan" value={`RM ${revenue.toLocaleString()}`} />
          </Section>
          <Section title="Pengguna Terkini">
            <div style={{ padding: "8px 0" }}>
              {users?.slice(0, 4).map(u => {
                const colors = ROLE_COLORS[u.role] ?? ROLE_COLORS.user;
                return (
                  <div key={u._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px" }}>
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "oklch(0.09 0.006 264)", margin: 0 }}>{u.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>{u.email}</p>
                    </div>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, background: colors.bg, color: colors.fg, padding: "2px 8px", borderRadius: "999px" }}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </div>
                );
              })}
              {!users?.length && <p style={{ padding: "16px 24px", fontSize: "0.875rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>Tiada pengguna.</p>}
            </div>
          </Section>
        </div>
      )}

      {/* Tab: Agreements */}
      {tab === "agreements" && (
        <Section title="Senarai Perjanjian">
          {!agreements?.length ? (
            <p style={{ padding: "40px 24px", textAlign: "center", color: "oklch(0.56 0.003 264)", fontSize: "0.875rem" }}>
              Tiada perjanjian lagi untuk firma ini.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "oklch(0.955 0.002 264)" }}>
                  {["Rujukan", "Tuan Rumah", "Penyewa", "Sewa", "Status", "Tarikh"].map(h => (
                    <th key={h} style={{
                      padding: "10px 18px", textAlign: "left", fontSize: "0.6875rem",
                      fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
                      color: "oklch(0.54 0.003 264)", borderBottom: "1px solid oklch(0.880 0.002 264)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agreements.map((a, idx) => {
                  const s = STATUS_MAP[a.status] ?? STATUS_MAP.draft;
                  return (
                    <tr key={a._id} style={{
                      background: idx % 2 === 0 ? "oklch(0.998 0 0)" : "oklch(0.980 0.001 264)",
                      borderBottom: idx < agreements.length - 1 ? "1px solid oklch(0.918 0.002 264)" : "none",
                    }}>
                      <td style={{ padding: "12px 18px", fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", fontFamily: "monospace" }}>
                        {a.agreementRef ?? "—"}
                      </td>
                      <td style={{ padding: "12px 18px", fontWeight: 600, fontSize: "0.875rem", color: "oklch(0.09 0.006 264)" }}>
                        {a.landlordName}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "0.875rem", color: "oklch(0.42 0.003 264)" }}>
                        {a.tenantName}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "0.875rem", fontWeight: 700, color: "oklch(0.20 0.004 264)" }}>
                        RM {a.monthlyRent.toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ background: s.bg, color: s.fg, padding: "3px 10px", borderRadius: "999px", fontSize: "0.6875rem", fontWeight: 600 }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)" }}>
                        {timeAgo(a.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {/* Tab: Users */}
      {tab === "users" && (
        <Section title="Pengguna Firma">
          <div style={{ padding: "8px 0" }}>
            {users?.map((u, idx) => {
              const colors = ROLE_COLORS[u.role] ?? ROLE_COLORS.user;
              return (
                <div key={u._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: idx < (users.length - 1) ? "1px solid oklch(0.938 0.002 264)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: "oklch(0.938 0.002 264)", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.875rem", fontWeight: 700, color: "oklch(0.44 0.003 264)",
                    }}>
                      {u.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "oklch(0.09 0.006 264)", margin: 0 }}>{u.name}</p>
                      <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", margin: "2px 0 0" }}>{u.email}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {roleUpdating === u._id ? (
                      <span style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)" }}>Menyimpan...</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        style={{
                          padding: "6px 28px 6px 12px", borderRadius: "8px",
                          border: `1px solid ${colors.bg}`,
                          background: colors.bg, color: colors.fg,
                          fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
                          outline: "none", appearance: "none",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                        }}
                      >
                        <option value="firm_owner">Pemilik Firma</option>
                        <option value="lawyer">Peguam</option>
                        <option value="admin">Admin</option>
                        <option value="user">Menunggu</option>
                      </select>
                    )}
                    <span style={{ fontSize: "0.75rem", color: "oklch(0.70 0.003 264)" }}>
                      {timeAgo(u.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            {!users?.length && (
              <p style={{ padding: "40px 24px", textAlign: "center", color: "oklch(0.56 0.003 264)", fontSize: "0.875rem" }}>
                Tiada pengguna dalam firma ini.
              </p>
            )}
          </div>
        </Section>
      )}

      {/* Tab: Settings */}
      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Section title="Maklumat Asas">
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.28 0.003 264)" }}>Nama Firma</label>
                <input
                  defaultValue={firm.name}
                  onBlur={async e => { if (e.target.value !== firm.name) await updateFirm({ id: firmId, name: e.target.value }); }}
                  style={{
                    padding: "10px 14px", border: "1.5px solid oklch(0.876 0.003 264)",
                    borderRadius: "10px", fontSize: "0.9375rem",
                    color: "oklch(0.09 0.006 264)", background: "oklch(0.998 0 0)", outline: "none",
                  }}
                  onFocus={e => (e.target.style.borderColor = "oklch(0.55 0.14 40)")}
                />
              </div>
            </div>
          </Section>

          {/* Danger Zone — Airbnb style */}
          <div style={{
            background: "oklch(0.998 0 0)", border: "1.5px solid oklch(0.85 0.08 27 / 0.4)",
            borderRadius: "16px", overflow: "hidden",
          }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid oklch(0.93 0.06 27 / 0.3)", background: "oklch(0.98 0.02 27 / 0.3)" }}>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "oklch(0.45 0.15 27)", margin: 0 }}>⚠️ Zon Bahaya</p>
            </div>
            <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "oklch(0.09 0.006 264)", margin: "0 0 4px" }}>
                  {firm.isActive ? "Nyahaktifkan Firma" : "Aktifkan Semula Firma"}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", margin: 0, maxWidth: "480px" }}>
                  {firm.isActive
                    ? "Firma ini tidak akan dapat log masuk atau mengakses platform. Semua data dan perjanjian dipelihara. Boleh diaktifkan semula pada bila-bila masa."
                    : "Firma ini akan dapat log masuk dan menggunakan platform semula. Semua data masih utuh."}
                </p>
              </div>
              {deactivateConfirm ? (
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button onClick={handleToggleActive} style={{
                    background: firm.isActive ? "oklch(0.48 0.18 27)" : "oklch(0.42 0.09 145)",
                    color: "oklch(0.998 0 0)", border: "none", borderRadius: "10px",
                    padding: "10px 18px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                  }}>Sahkan</button>
                  <button onClick={() => setDeactivateConfirm(false)} style={{
                    background: "none", border: "1px solid oklch(0.876 0.003 264)",
                    borderRadius: "10px", padding: "10px 16px",
                    fontSize: "0.875rem", cursor: "pointer", color: "oklch(0.56 0.003 264)",
                  }}>Batal</button>
                </div>
              ) : (
                <button onClick={() => setDeactivateConfirm(true)} style={{
                  background: firm.isActive ? "oklch(0.48 0.18 27 / 0.08)" : "oklch(0.42 0.09 145 / 0.08)",
                  color: firm.isActive ? "oklch(0.48 0.18 27)" : "oklch(0.35 0.10 148)",
                  border: `1.5px solid ${firm.isActive ? "oklch(0.48 0.18 27 / 0.4)" : "oklch(0.42 0.09 145 / 0.4)"}`,
                  borderRadius: "10px", padding: "10px 20px", fontSize: "0.875rem",
                  fontWeight: 600, cursor: "pointer", flexShrink: 0,
                  transition: "all 150ms ease-out",
                }}>
                  {firm.isActive ? "Nyahaktifkan" : "Aktifkan Semula"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
