"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAppUser } from "@/hooks/use-app-user";

const statusMap: Record<string, { label: string; bg: string; color: string }> = {
  draft:             { label: "Draft",          bg: "oklch(0.90 0.014 56)",   color: "oklch(0.38 0.025 50)" },
  pending_review:    { label: "Pending Review", bg: "oklch(0.93 0.07 72)",    color: "oklch(0.38 0.12 65)" },
  changes_requested: { label: "Changes Needed", bg: "oklch(0.93 0.06 27)",    color: "oklch(0.38 0.12 27)" },
  approved:          { label: "Approved",        bg: "oklch(0.90 0.07 145)",   color: "oklch(0.32 0.10 145)" },
  pending_stamp:     { label: "Awaiting Stamp", bg: "oklch(0.91 0.05 290)",   color: "oklch(0.38 0.10 290)" },
  stamped:           { label: "Stamped",         bg: "oklch(0.90 0.07 145)",   color: "oklch(0.32 0.10 145)" },
  completed:         { label: "Completed",       bg: "oklch(0.38 0.09 145)",   color: "oklch(0.97 0.008 58)" },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Selamat pagi";
  if (h < 17) return "Selamat petang";
  return "Selamat malam";
}

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

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "oklch(0.55 0.14 40)" }}>
            {new Date().toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 style={{
            fontSize: "2.25rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "oklch(0.13 0.025 45)"
          }}>
            {greeting()},<br />
            <span style={{ color: "oklch(0.55 0.14 40)" }}>
              {appUser?.name?.split(" ")[0] ?? "selamat datang"}.
            </span>
          </h1>
        </div>
        <Link href="/dashboard/agreements/new">
          <button style={{
            background: "oklch(0.55 0.14 40)",
            color: "oklch(0.99 0.005 58)",
            border: "none",
            borderRadius: "14px",
            padding: "12px 24px",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 150ms ease-out, transform 150ms ease-out",
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "oklch(0.38 0.08 45)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "oklch(0.55 0.14 40)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}>
            + Perjanjian Baru
          </button>
        </Link>
      </div>

      {/* Stats — four columns, varied visual weight */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending Review", value: counts?.pendingReview ?? 0, sub: "Tunggu peguam", accent: true },
          { label: "Awaiting Stamp", value: counts?.pendingStamp ?? 0, sub: "Sedia hantar", accent: false },
          { label: "Completed", value: counts?.completed ?? 0, sub: "Bulan ini", accent: false },
          { label: "Total", value: counts?.totalThisMonth ?? 0, sub: "Perjanjian bulan ini", accent: false },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.accent && (counts?.pendingReview ?? 0) > 0
              ? "oklch(0.55 0.14 40)"
              : "oklch(0.97 0.012 58)",
            border: `1px solid ${s.accent && (counts?.pendingReview ?? 0) > 0 ? "transparent" : "oklch(0.87 0.016 55)"}`,
            borderRadius: "18px",
            padding: "24px",
            transition: "box-shadow 150ms ease-out",
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px oklch(0.16 0.04 45 / 0.10)")}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
            <p style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: s.accent && (counts?.pendingReview ?? 0) > 0
                ? "oklch(0.99 0.005 58)"
                : "oklch(0.13 0.025 45)",
            }}>{s.value}</p>
            <p style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              marginTop: "8px",
              color: s.accent && (counts?.pendingReview ?? 0) > 0
                ? "oklch(0.90 0.04 40)"
                : "oklch(0.28 0.04 45)",
            }}>{s.label}</p>
            <p style={{
              fontSize: "0.75rem",
              marginTop: "2px",
              color: s.accent && (counts?.pendingReview ?? 0) > 0
                ? "oklch(0.80 0.06 40)"
                : "oklch(0.55 0.025 50)",
            }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Agreements table */}
      <div style={{
        background: "oklch(0.99 0.005 58)",
        border: "1px solid oklch(0.87 0.016 55)",
        borderRadius: "20px",
        overflow: "hidden",
      }}>
        {/* Table header */}
        <div style={{
          padding: "18px 28px",
          borderBottom: "1px solid oklch(0.90 0.014 56)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "oklch(0.13 0.025 45)" }}>
            Senarai Perjanjian
          </p>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "oklch(0.55 0.025 50)",
            background: "oklch(0.90 0.014 56)",
            padding: "3px 10px",
            borderRadius: "999px",
          }}>
            {agreements?.length ?? 0} rekod
          </span>
        </div>

        {!agreements || agreements.length === 0 ? (
          <div style={{ padding: "64px 28px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px",
              background: "oklch(0.93 0.02 58)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "1.5rem",
            }}>📄</div>
            <p style={{ fontWeight: 600, color: "oklch(0.28 0.04 45)", fontSize: "0.9375rem" }}>
              Tiada perjanjian lagi
            </p>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.55 0.025 50)", marginTop: "4px", marginBottom: "20px" }}>
              Cipta perjanjian pertama untuk bermula.
            </p>
            <Link href="/dashboard/agreements/new">
              <button style={{
                background: "oklch(0.55 0.14 40)",
                color: "oklch(0.99 0.005 58)",
                border: "none",
                borderRadius: "12px",
                padding: "10px 20px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}>
                + Perjanjian Baru
              </button>
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(0.90 0.014 56)" }}>
                {["Tuan Rumah", "Penyewa", "Hartanah", "Sewa", "Status", "Tarikh", ""].map((h) => (
                  <th key={h} style={{
                    padding: "10px 28px",
                    textAlign: "left",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "oklch(0.60 0.025 50)",
                    background: "oklch(0.97 0.012 58)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agreements.map((a, idx) => {
                const s = statusMap[a.status] ?? statusMap.draft;
                return (
                  <tr key={a._id}
                    style={{
                      borderBottom: idx < agreements.length - 1 ? "1px solid oklch(0.92 0.012 56)" : "none",
                      transition: "background 100ms ease-out",
                      cursor: "default",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.95 0.016 58)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "16px 28px", fontWeight: 600, fontSize: "0.875rem", color: "oklch(0.13 0.025 45)" }}>
                      {a.landlordName}
                    </td>
                    <td style={{ padding: "16px 28px", fontSize: "0.875rem", color: "oklch(0.48 0.025 50)" }}>
                      {a.tenantName}
                    </td>
                    <td style={{ padding: "16px 28px", fontSize: "0.875rem", color: "oklch(0.48 0.025 50)", maxWidth: "180px" }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.propertyAddress.split(",")[0]}
                      </span>
                    </td>
                    <td style={{ padding: "16px 28px", fontSize: "0.875rem", fontWeight: 600, color: "oklch(0.28 0.04 45)" }}>
                      RM {a.monthlyRent.toLocaleString()}
                    </td>
                    <td style={{ padding: "16px 28px" }}>
                      <span style={{
                        background: s.bg,
                        color: s.color,
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: "16px 28px", fontSize: "0.8125rem", color: "oklch(0.60 0.020 50)" }}>
                      {new Date(a.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "16px 28px" }}>
                      <Link href={`/dashboard/agreements/${a._id}`}>
                        <button style={{
                          color: "oklch(0.55 0.14 40)",
                          background: "none",
                          border: "none",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          transition: "background 100ms ease-out",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.93 0.05 40 / 0.2)")}
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
