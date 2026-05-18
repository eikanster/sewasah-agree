"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAppUser } from "@/hooks/use-app-user";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; bg: string; fg: string; pulse: boolean }> = {
  draft:             { label: "Draf",           bg: "var(--status-draft-bg)",    fg: "var(--status-draft-fg)",    pulse: false },
  pending_review:    { label: "Menunggu Semak", bg: "var(--status-pending-bg)",  fg: "var(--status-pending-fg)",  pulse: true  },
  changes_requested: { label: "Perlu Pindaan",  bg: "oklch(0.93 0.06 27)",       fg: "oklch(0.38 0.12 27)",       pulse: false },
  approved:          { label: "Diluluskan",     bg: "var(--status-approved-bg)", fg: "var(--status-approved-fg)", pulse: false },
  pending_stamp:     { label: "Tunggu Setem",   bg: "var(--status-stamp-bg)",    fg: "var(--status-stamp-fg)",    pulse: true  },
  stamped:           { label: "Disetem",        bg: "var(--status-approved-bg)", fg: "var(--status-approved-fg)", pulse: false },
  completed:         { label: "Selesai",        bg: "var(--status-done-bg)",     fg: "var(--status-done-fg)",     pulse: false },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Selamat pagi";
  if (h < 17) return "Selamat petang";
  return "Selamat malam";
}

function today() {
  return new Date().toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
  value, label, sub, terracotta, delay, large,
}: { value: number; label: string; sub: string; terracotta?: boolean; delay: number; large?: boolean }) {
  const active = terracotta && value > 0;
  const bg   = active ? "oklch(0.55 0.14 40)" : "oklch(0.963 0.002 264)";
  const num  = active ? "oklch(0.998 0 0)" : "oklch(0.09 0.006 264)";
  const lbl  = active ? "oklch(0.88 0.05 40)"  : "oklch(0.20 0.004 264)";
  const hint = active ? "oklch(0.78 0.08 40)"  : "oklch(0.50 0.003 264)";
  const bdr  = active ? "transparent"           : "oklch(0.876 0.003 264)";
  const shd  = active
    ? "0 8px 32px oklch(0.55 0.14 40 / 0.32), 0 2px 8px oklch(0.55 0.14 40 / 0.20)"
    : "0 1px 3px oklch(0.12 0.006 264 / 0.06)";

  return (
    <div className="card-lift count-in" style={{
      background: bg,
      border: `1.5px solid ${bdr}`,
      borderRadius: "18px",
      padding: large ? "28px 32px" : "24px",
      boxShadow: shd,
      animationDelay: `${delay}ms`,
      position: "relative",
      overflow: "hidden",
      minHeight: large ? "120px" : undefined,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      {!active && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "18px",
          boxShadow: "inset 0 1px 0 oklch(0.998 0 0 / 0.8)",
          pointerEvents: "none",
        }} />
      )}
      {active && large && (
        <div style={{
          position: "absolute", top: "-20px", right: "-20px",
          width: "120px", height: "120px", borderRadius: "50%",
          background: "oklch(0.62 0.14 40 / 0.25)",
          pointerEvents: "none",
        }} />
      )}
      <p className="count-in" style={{
        fontSize: large ? "3.75rem" : "2.75rem",
        fontWeight: 800,
        letterSpacing: "-0.04em", lineHeight: 1,
        color: num, animationDelay: `${delay + 60}ms`,
      }}>{value}</p>
      <div>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, marginTop: "10px", color: lbl }}>{label}</p>
        <p style={{ fontSize: "0.75rem", marginTop: "3px", color: hint }}>{sub}</p>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { appUser } = useAppUser();

  const agreements = useQuery(
    api.agreements.listByFirm,
    appUser?.firmId ? { firmId: appUser.firmId } : "skip"
  );
  const counts = useQuery(
    api.agreements.getDashboardCounts,
    appUser?.firmId ? { firmId: appUser.firmId } : "skip"
  );

  const firstName = appUser?.name?.split(" ")[0] ?? "";

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <p style={{
            fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "oklch(0.55 0.14 40)",
            marginBottom: "6px",
          }}>{today()}</p>
          <h1 style={{
            fontSize: "2.5rem", fontWeight: 800,
            letterSpacing: "-0.035em", lineHeight: 1.05,
            color: "oklch(0.09 0.006 264)", margin: 0,
          }}>
            {greeting()}{firstName ? "," : "."}<br />
            {firstName && (
              <span style={{ color: "oklch(0.55 0.14 40)" }}>{firstName}.</span>
            )}
          </h1>
        </div>

        <Link href="/dashboard/agreements/new">
          <button className="btn-brand">+ Perjanjian Baru</button>
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <StatCard value={counts?.pendingReview  ?? 0} label="Menunggu Semak" sub="Perlu tindakan peguam"  terracotta large delay={0}   />
        <StatCard value={counts?.pendingStamp   ?? 0} label="Tunggu Setem"   sub="Sedia untuk eDutiSetem" delay={60}  />
        <StatCard value={counts?.completed      ?? 0} label="Selesai"        sub="Bulan ini"              delay={120} />
        <StatCard value={counts?.totalThisMonth ?? 0} label="Jumlah"         sub="Perjanjian bulan ini"   large delay={180} />
      </div>

      {/* ── Table ── */}
      <div style={{
        background: "oklch(0.963 0.002 264)",
        border: "1.5px solid oklch(0.876 0.003 264)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.06), inset 0 1px 0 oklch(0.998 0 0 / 0.7)",
      }}>

        {/* Table topbar */}
        <div style={{
          padding: "16px 28px",
          borderBottom: "1px solid oklch(0.895 0.002 264)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "oklch(0.963 0.002 264)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "oklch(0.09 0.006 264)", margin: 0 }}>
              Senarai Perjanjian
            </p>
            {(agreements?.length ?? 0) > 0 && (
              <span style={{
                fontSize: "0.6875rem", fontWeight: 600,
                background: "oklch(0.938 0.002 264)",
                color: "oklch(0.44 0.003 264)",
                padding: "2px 8px", borderRadius: "999px",
              }}>{agreements?.length} rekod</span>
            )}
          </div>
          <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>
            {new Date().toLocaleDateString("ms-MY", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Empty state */}
        {(!agreements || agreements.length === 0) && (
          <div style={{ padding: "72px 40px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", margin: "0 auto 20px",
              background: "oklch(0.938 0.002 264)", borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.625rem",
            }}>📄</div>
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "oklch(0.15 0.004 264)", marginBottom: "6px" }}>
              Tiada perjanjian lagi
            </p>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.50 0.003 264)", marginBottom: "24px", maxWidth: "280px", margin: "0 auto 24px" }}>
              Cipta perjanjian pertama untuk memulakan.
            </p>
            <Link href="/dashboard/agreements/new">
              <button className="btn-brand" style={{ fontSize: "0.875rem", padding: "10px 20px" }}>
                + Perjanjian Baru
              </button>
            </Link>
          </div>
        )}

        {/* Rows */}
        {agreements && agreements.length > 0 && (
          <table className="mobile-card-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "oklch(0.952 0.002 264)" }}>
                {[
                  { label: "Tuan Rumah", w: "18%",  hide: false },
                  { label: "Penyewa",    w: "18%",  hide: true  },
                  { label: "Hartanah",   w: "22%",  hide: true  },
                  { label: "Sewa",       w: "12%",  hide: false },
                  { label: "Status",     w: "18%",  hide: false },
                  { label: "Tarikh",     w: "10%",  hide: true  },
                  { label: "",           w: "2%",   hide: false },
                ].map(({ label, w, hide }) => (
                  <th key={label} className={hide ? "col-hide-mobile" : ""} style={{
                    padding: "10px 20px",
                    textAlign: "left",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "oklch(0.54 0.003 264)",
                    borderBottom: "1px solid oklch(0.880 0.002 264)",
                    width: w,
                  }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agreements.map((a, idx) => {
                const s = STATUS[a.status] ?? STATUS.draft;
                const even = idx % 2 === 0;
                return (
                  <tr key={a._id}
                    style={{
                      background: even ? "oklch(0.980 0.001 264)" : "oklch(0.963 0.002 264)",
                      borderBottom: idx < agreements.length - 1
                        ? "1px solid oklch(0.918 0.002 264)" : "none",
                      transition: "background 100ms ease-out",
                      cursor: "default",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.945 0.002 264)")}
                    onMouseLeave={e => (e.currentTarget.style.background = even ? "oklch(0.980 0.001 264)" : "oklch(0.963 0.002 264)")}>

                    <td style={{ padding: "15px 20px", fontWeight: 600, fontSize: "0.875rem", color: "oklch(0.09 0.006 264)" }}>
                      {a.landlordName}
                    </td>
                    <td className="col-hide-mobile" style={{ padding: "15px 20px", fontSize: "0.875rem", color: "oklch(0.42 0.003 264)" }}>
                      {a.tenantName}
                    </td>
                    <td className="col-hide-mobile" style={{ padding: "15px 20px", fontSize: "0.875rem", color: "oklch(0.42 0.003 264)", maxWidth: "200px" }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.propertyAddress.split(",")[0]}
                      </span>
                    </td>
                    <td style={{ padding: "15px 20px", fontSize: "0.875rem", fontWeight: 700, color: "oklch(0.20 0.004 264)", letterSpacing: "-0.01em" }}>
                      RM {a.monthlyRent.toLocaleString()}
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <span className={s.pulse ? "pulse-dot" : ""} style={{
                        background: s.bg,
                        color: s.fg,
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                      }}>{s.label}</span>
                    </td>
                    <td className="col-hide-mobile" style={{ padding: "15px 20px", fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", whiteSpace: "nowrap" }}>
                      {new Date(a.createdAt).toLocaleDateString("ms-MY", { day: "numeric", month: "short" })}
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <Link href={`/dashboard/agreements/${a._id}`}>
                        <button style={{
                          background: "none", border: "none",
                          color: "oklch(0.55 0.14 40)",
                          fontSize: "0.8125rem", fontWeight: 600,
                          cursor: "pointer", padding: "5px 10px",
                          borderRadius: "8px",
                          transition: "background 120ms ease-out",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.55 0.14 40 / 0.10)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                          Buka →
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
