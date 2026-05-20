"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  return `${days} hari lalu`;
}

export default function AdminPage() {
  const firms = useQuery(api.firms.listWithStats);

  const totalAgreements = firms?.reduce((s, f) => s + f.totalAgreements, 0) ?? 0;
  const totalCompleted  = firms?.reduce((s, f) => s + f.completedAgreements, 0) ?? 0;
  const totalPending    = firms?.reduce((s, f) => s + f.pendingReview, 0) ?? 0;
  const totalRevenue    = totalCompleted * 40; // RM 40 margin per agreement

  return (
    <div style={{ maxWidth: "1100px" }} className="page-enter">

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "6px" }}>
          Platform Overview
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em",
          color: "oklch(0.09 0.006 264)", margin: 0 }}>
          Semua Firma
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "oklch(0.56 0.003 264)", marginTop: "6px" }}>
          {firms?.length ?? 0} firma berdaftar pada platform Sewasah Agree
        </p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ marginBottom: "32px" }}>
        {[
          { label: "Jumlah Firma",      value: firms?.length ?? 0,  sub: "Berdaftar",          accent: false },
          { label: "Jumlah Perjanjian", value: totalAgreements,      sub: "Semua firma",        accent: false },
          { label: "Menunggu Semak",    value: totalPending,         sub: "Perlu tindakan",     accent: totalPending > 0 },
          { label: "Pendapatan",        value: `RM ${totalRevenue.toLocaleString()}`, sub: "Anggaran (RM40/selesai)", accent: false, isStr: true },
        ].map(({ label, value, sub, accent, isStr }) => (
          <div key={label} style={{
            background: accent ? "oklch(0.55 0.14 40)" : "oklch(0.998 0 0)",
            border: `1px solid ${accent ? "transparent" : "oklch(0.876 0.003 264)"}`,
            borderRadius: "14px", padding: "20px 22px",
            boxShadow: accent
              ? "0 6px 24px oklch(0.55 0.14 40 / 0.28)"
              : "0 1px 2px oklch(0.12 0.006 264 / 0.05)",
          }}>
            <p style={{
              fontSize: isStr ? "1.5rem" : "2.25rem", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1,
              color: accent ? "oklch(0.998 0 0)" : "oklch(0.09 0.006 264)",
            }}>{value}</p>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, marginTop: "8px",
              color: accent ? "oklch(0.88 0.05 40)" : "oklch(0.20 0.004 264)" }}>{label}</p>
            <p style={{ fontSize: "0.6875rem", marginTop: "2px",
              color: accent ? "oklch(0.78 0.08 40)" : "oklch(0.56 0.003 264)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Firms Table */}
      <div style={{
        background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "16px", overflow: "hidden",
        boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05)",
      }}>
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid oklch(0.895 0.002 264)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "oklch(0.998 0 0)",
        }}>
          <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "oklch(0.09 0.006 264)", margin: 0 }}>
            Senarai Firma
          </p>
          <span style={{
            fontSize: "0.6875rem", fontWeight: 600,
            background: "oklch(0.938 0.002 264)", color: "oklch(0.44 0.003 264)",
            padding: "2px 8px", borderRadius: "999px",
          }}>{firms?.length ?? 0} firma</span>
        </div>

        {!firms && (
          <div style={{ padding: "48px", textAlign: "center", color: "oklch(0.56 0.003 264)", fontSize: "0.875rem" }}>
            Memuatkan...
          </div>
        )}

        {firms && firms.length === 0 && (
          <div style={{ padding: "64px", textAlign: "center" }}>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "oklch(0.20 0.004 264)", marginBottom: "6px" }}>
              Tiada firma lagi
            </p>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.56 0.003 264)" }}>
              Firma pertama akan muncul di sini setelah mendaftar.
            </p>
          </div>
        )}

        {firms && firms.length > 0 && (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "oklch(0.955 0.002 264)" }}>
                  {["Firma", "Peguam / Bar", "Perjanjian", "Selesai", "Menunggu", "Pengguna", "Aktif", ""].map(h => (
                    <th key={h} style={{
                      padding: "10px 18px", textAlign: "left",
                      fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.07em",
                      textTransform: "uppercase", color: "oklch(0.54 0.003 264)",
                      borderBottom: "1px solid oklch(0.880 0.002 264)",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {firms.map((firm, idx) => {
                  const even = idx % 2 === 0;
                  return (
                    <tr key={firm._id}
                      style={{
                        background: even ? "oklch(0.998 0 0)" : "oklch(0.980 0.001 264)",
                        borderBottom: idx < firms.length - 1 ? "1px solid oklch(0.918 0.002 264)" : "none",
                        transition: "background 100ms ease-out",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.945 0.002 264)")}
                      onMouseLeave={e => (e.currentTarget.style.background = even ? "oklch(0.998 0 0)" : "oklch(0.980 0.001 264)")}>
  
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "34px", height: "34px", borderRadius: "10px",
                            background: "oklch(0.55 0.14 40)", flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.75rem", fontWeight: 800, color: "oklch(0.998 0 0)",
                          }}>
                            {firm.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "oklch(0.09 0.006 264)", margin: 0 }}>
                              {firm.name}
                            </p>
                            {firm.email && (
                              <p style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>
                                {firm.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
  
                      <td style={{ padding: "14px 18px" }}>
                        {firm.lawyerName ? (
                          <div>
                            <p style={{ fontSize: "0.875rem", color: "oklch(0.20 0.004 264)", margin: 0, fontWeight: 500 }}>
                              {firm.lawyerName}
                            </p>
                            {firm.barNo && (
                              <p style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>
                                {firm.barNo}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8125rem", color: "oklch(0.70 0.003 264)" }}>—</span>
                        )}
                      </td>
  
                      <td style={{ padding: "14px 18px", fontSize: "0.9375rem", fontWeight: 700, color: "oklch(0.09 0.006 264)" }}>
                        {firm.totalAgreements}
                      </td>
  
                      <td style={{ padding: "14px 18px" }}>
                        {firm.completedAgreements > 0 ? (
                          <span style={{
                            fontSize: "0.8125rem", fontWeight: 600,
                            color: "oklch(0.30 0.100 148)",
                            background: "oklch(0.900 0.068 148)",
                            padding: "3px 10px", borderRadius: "999px",
                          }}>{firm.completedAgreements}</span>
                        ) : (
                          <span style={{ fontSize: "0.8125rem", color: "oklch(0.70 0.003 264)" }}>—</span>
                        )}
                      </td>
  
                      <td style={{ padding: "14px 18px" }}>
                        {firm.pendingReview > 0 ? (
                          <span style={{
                            fontSize: "0.8125rem", fontWeight: 600,
                            color: "oklch(0.38 0.120 65)",
                            background: "oklch(0.930 0.065 72)",
                            padding: "3px 10px", borderRadius: "999px",
                          }}>{firm.pendingReview}</span>
                        ) : (
                          <span style={{ fontSize: "0.8125rem", color: "oklch(0.70 0.003 264)" }}>—</span>
                        )}
                      </td>
  
                      <td style={{ padding: "14px 18px", fontSize: "0.875rem", color: "oklch(0.42 0.003 264)" }}>
                        {firm.totalUsers}
                      </td>
  
                      <td style={{ padding: "14px 18px", fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", whiteSpace: "nowrap" }}>
                        {timeAgo(firm.lastActivity)}
                      </td>
  
                      <td style={{ padding: "14px 18px" }}>
                        <Link href={`/admin/firms/${firm._id}`}>
                          <button style={{
                            background: "none", border: "1px solid oklch(0.876 0.003 264)",
                            color: "oklch(0.55 0.14 40)", fontSize: "0.8125rem", fontWeight: 600,
                            cursor: "pointer", padding: "5px 12px", borderRadius: "8px",
                            transition: "all 120ms ease-out", whiteSpace: "nowrap",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = "oklch(0.55 0.14 40)";
                            (e.currentTarget as HTMLElement).style.color = "oklch(0.998 0 0)";
                            (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.55 0.14 40)";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "none";
                            (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.14 40)";
                            (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.876 0.003 264)";
                          }}>
                            Lihat →
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
