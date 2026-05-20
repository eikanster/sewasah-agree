"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAppUser } from "@/hooks/use-app-user";
import { useState, useMemo } from "react";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; bg: string; fg: string; pulse: boolean }> = {
  draft:             { label: "Draf",           bg: "oklch(0.938 0.002 264)",  fg: "oklch(0.38 0.003 264)",  pulse: false },
  pending_review:    { label: "Menunggu Semak", bg: "oklch(0.930 0.065 72)",   fg: "oklch(0.38 0.120 65)",   pulse: true  },
  changes_requested: { label: "Perlu Pindaan",  bg: "oklch(0.93 0.06 27)",    fg: "oklch(0.38 0.12 27)",    pulse: false },
  approved:          { label: "Diluluskan",     bg: "oklch(0.900 0.068 148)",  fg: "oklch(0.30 0.100 148)",  pulse: false },
  pending_stamp:     { label: "Tunggu Setem",   bg: "oklch(0.910 0.050 292)",  fg: "oklch(0.36 0.105 292)",  pulse: true  },
  stamped:           { label: "Disetem",        bg: "oklch(0.900 0.068 148)",  fg: "oklch(0.30 0.100 148)",  pulse: false },
  completed:         { label: "Selesai",        bg: "oklch(0.380 0.090 148)",  fg: "oklch(0.970 0.008 58)",  pulse: false },
};

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "draft", label: "Draf" },
  { value: "pending_review", label: "Menunggu Semak" },
  { value: "changes_requested", label: "Perlu Pindaan" },
  { value: "approved", label: "Diluluskan" },
  { value: "pending_stamp", label: "Tunggu Setem" },
  { value: "stamped", label: "Disetem" },
  { value: "completed", label: "Selesai" },
];

type SortField = "landlordName" | "tenantName" | "monthlyRent" | "createdAt" | "status";
type SortDir = "asc" | "desc";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Selamat pagi";
  if (h < 17) return "Selamat petang";
  return "Selamat malam";
}

function today() {
  return new Date().toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ── Compact Stat Card ──────────────────────────────────────────────────────
function StatCard({ value, label, sub, accent, delay }: {
  value: number; label: string; sub: string; accent?: boolean; delay: number;
}) {
  const isActive = accent && value > 0;
  return (
    <div className="card-lift count-in" style={{
      background: isActive ? "oklch(0.55 0.14 40)" : "oklch(0.998 0 0)",
      border: `1px solid ${isActive ? "transparent" : "oklch(0.876 0.003 264)"}`,
      borderRadius: "14px",
      padding: "20px 22px",
      animationDelay: `${delay}ms`,
      boxShadow: isActive
        ? "0 6px 24px oklch(0.55 0.14 40 / 0.28)"
        : "0 1px 2px oklch(0.12 0.006 264 / 0.05)",
    }}>
      <p className="count-in" style={{
        fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
        color: isActive ? "oklch(0.998 0 0)" : "oklch(0.09 0.006 264)",
        animationDelay: `${delay + 60}ms`,
      }}>{value}</p>
      <p style={{
        fontSize: "0.8125rem", fontWeight: 600, marginTop: "8px",
        color: isActive ? "oklch(0.88 0.05 40)" : "oklch(0.20 0.004 264)",
      }}>{label}</p>
      <p style={{
        fontSize: "0.6875rem", marginTop: "2px",
        color: isActive ? "oklch(0.78 0.08 40)" : "oklch(0.56 0.003 264)",
      }}>{sub}</p>
    </div>
  );
}

// ── Sort Header ────────────────────────────────────────────────────────────
function SortTh({ label, field, sort, dir, onSort, width }: {
  label: string; field: SortField; sort: SortField; dir: SortDir;
  onSort: (f: SortField) => void; width?: string;
}) {
  const active = sort === field;
  return (
    <th
      onClick={() => onSort(field)}
      style={{
        padding: "10px 18px", textAlign: "left", cursor: "pointer",
        fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.07em",
        textTransform: "uppercase", width,
        color: active ? "oklch(0.55 0.14 40)" : "oklch(0.54 0.003 264)",
        borderBottom: "1px solid oklch(0.880 0.002 264)",
        background: "oklch(0.955 0.002 264)",
        userSelect: "none",
        whiteSpace: "nowrap",
        transition: "color 120ms ease-out",
      }}
    >
      {label}
      <span style={{ marginLeft: "4px", opacity: active ? 1 : 0.3 }}>
        {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </th>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { appUser } = useAppUser();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const agreements = useQuery(
    api.agreements.listByFirm,
    appUser?.firmId ? { firmId: appUser.firmId } : "skip"
  );
  const counts = useQuery(
    api.agreements.getDashboardCounts,
    appUser?.firmId ? { firmId: appUser.firmId } : "skip"
  );

  const firstName = appUser?.name?.split(" ")[0] ?? "";

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    if (!agreements) return [];
    let rows = [...agreements];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(a =>
        a.landlordName.toLowerCase().includes(q) ||
        a.tenantName.toLowerCase().includes(q) ||
        a.propertyAddress.toLowerCase().includes(q) ||
        (a.agreementRef ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter) rows = rows.filter(a => a.status === statusFilter);
    rows.sort((a, b) => {
      let va: string | number = a[sortField] ?? 0;
      let vb: string | number = b[sortField] ?? 0;
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [agreements, search, statusFilter, sortField, sortDir]);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <p style={{
            fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "4px",
          }}>{today()}</p>
          <h1 style={{
            fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
            color: "oklch(0.09 0.006 264)", margin: 0,
          }}>
            {greeting()}{firstName ? `, ` : `.`}
            {firstName && <span style={{ color: "oklch(0.55 0.14 40)" }}>{firstName}.</span>}
          </h1>
        </div>
        <Link href="/dashboard/agreements/new">
          <button className="btn-brand">+ Perjanjian Baru</button>
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <StatCard value={counts?.pendingReview  ?? 0} label="Menunggu Semak" sub="Perlu tindakan peguam"  accent  delay={0}   />
        <StatCard value={counts?.pendingStamp   ?? 0} label="Tunggu Setem"   sub="Sedia untuk eDutiSetem"         delay={50}  />
        <StatCard value={counts?.completed      ?? 0} label="Selesai"        sub="Bulan ini"                      delay={100} />
        <StatCard value={counts?.totalThisMonth ?? 0} label="Jumlah"         sub="Perjanjian bulan ini"           delay={150} />
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center" style={{
        background: "oklch(0.998 0 0)",
        border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "14px", padding: "12px 16px",
        boxShadow: "0 1px 2px oklch(0.12 0.006 264 / 0.04)",
      }}>
        {/* Search */}
        <div className="w-full sm:flex-1" style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            fontSize: "0.875rem", color: "oklch(0.60 0.003 264)", pointerEvents: "none",
          }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, hartanah atau rujukan..."
            style={{
              width: "100%", padding: "8px 12px 8px 34px",
              border: "1px solid oklch(0.876 0.003 264)",
              borderRadius: "9px", fontSize: "0.875rem",
              color: "oklch(0.09 0.006 264)", background: "oklch(0.963 0.002 264)",
              outline: "none", transition: "border-color 150ms ease-out",
            }}
            onFocus={e => (e.target.style.borderColor = "oklch(0.55 0.14 40)")}
            onBlur={e => (e.target.style.borderColor = "oklch(0.876 0.003 264)")}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full sm:w-[180px]"
          style={{
            padding: "8px 32px 8px 12px", border: "1px solid oklch(0.876 0.003 264)",
            borderRadius: "9px", fontSize: "0.875rem",
            color: statusFilter ? "oklch(0.09 0.006 264)" : "oklch(0.56 0.003 264)",
            background: "oklch(0.963 0.002 264)",
            outline: "none", cursor: "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
          }}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Count */}
        {(search || statusFilter) && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <span style={{
              fontSize: "0.75rem", fontWeight: 600,
              color: "oklch(0.56 0.003 264)",
              background: "oklch(0.938 0.002 264)",
              padding: "4px 10px", borderRadius: "999px",
            }}>{filtered.length} rekod</span>
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); }}
              style={{
                fontSize: "0.75rem", color: "oklch(0.55 0.14 40)",
                background: "none", border: "none", cursor: "pointer",
                fontWeight: 500, padding: "4px 8px",
              }}
            >Kosongkan ×</button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{
        background: "oklch(0.998 0 0)",
        border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "16px", overflow: "hidden",
        boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05)",
      }}>

        {/* Table topbar */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid oklch(0.895 0.002 264)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "oklch(0.998 0 0)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "oklch(0.09 0.006 264)", margin: 0 }}>
              Senarai Perjanjian
            </p>
            <span style={{
              fontSize: "0.6875rem", fontWeight: 600,
              background: "oklch(0.938 0.002 264)", color: "oklch(0.44 0.003 264)",
              padding: "2px 8px", borderRadius: "999px",
            }}>{filtered.length} rekod</span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>
            {new Date().toLocaleDateString("ms-MY", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ padding: "56px 40px", textAlign: "center" }}>
            <div style={{
              width: "48px", height: "48px", margin: "0 auto 16px",
              background: "oklch(0.938 0.002 264)", borderRadius: "14px",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem",
            }}>📄</div>
            <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "oklch(0.15 0.004 264)", marginBottom: "4px" }}>
              {search || statusFilter ? "Tiada rekod dijumpai" : "Tiada perjanjian lagi"}
            </p>
            <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", marginBottom: "20px" }}>
              {search || statusFilter ? "Cuba ubah carian atau penapis anda" : "Cipta perjanjian pertama untuk memulakan"}
            </p>
            {!search && !statusFilter && (
              <Link href="/dashboard/agreements/new">
                <button className="btn-brand" style={{ fontSize: "0.875rem", padding: "9px 20px" }}>
                  + Perjanjian Baru
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="mobile-card-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <SortTh label="Tuan Rumah"  field="landlordName" sort={sortField} dir={sortDir} onSort={handleSort} width="18%" />
                  <SortTh label="Penyewa"     field="tenantName"   sort={sortField} dir={sortDir} onSort={handleSort} width="18%" />
                  <th className="col-hide-mobile" style={{
                    padding: "10px 18px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600,
                    letterSpacing: "0.07em", textTransform: "uppercase", width: "22%",
                    color: "oklch(0.54 0.003 264)", borderBottom: "1px solid oklch(0.880 0.002 264)",
                    background: "oklch(0.955 0.002 264)",
                  }}>Hartanah</th>
                  <SortTh label="Sewa"   field="monthlyRent" sort={sortField} dir={sortDir} onSort={handleSort} width="12%" />
                  <SortTh label="Status" field="status"      sort={sortField} dir={sortDir} onSort={handleSort} width="17%" />
                  <SortTh label="Tarikh" field="createdAt"   sort={sortField} dir={sortDir} onSort={handleSort} width="10%" />
                  <th style={{
                    padding: "10px 18px", background: "oklch(0.955 0.002 264)",
                    borderBottom: "1px solid oklch(0.880 0.002 264)", width: "3%",
                  }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, idx) => {
                  const s = STATUS[a.status] ?? STATUS.draft;
                  const even = idx % 2 === 0;
                  return (
                    <tr key={a._id}
                      style={{
                        background: even ? "oklch(0.998 0 0)" : "oklch(0.980 0.001 264)",
                        borderBottom: idx < filtered.length - 1
                          ? "1px solid oklch(0.918 0.002 264)" : "none",
                        transition: "background 100ms ease-out",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.945 0.002 264)")}
                      onMouseLeave={e => (e.currentTarget.style.background = even ? "oklch(0.998 0 0)" : "oklch(0.980 0.001 264)")}>

                      <td style={{ padding: "13px 18px", fontWeight: 600, fontSize: "0.875rem", color: "oklch(0.09 0.006 264)" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                          {a.landlordName}
                          {a.agreementRef && (
                            <span style={{ fontSize: "0.6875rem", color: "oklch(0.60 0.003 264)", fontWeight: 400 }}>
                              {a.agreementRef}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "13px 18px", fontSize: "0.875rem", color: "oklch(0.42 0.003 264)" }}>
                        {a.tenantName}
                      </td>
                      <td className="col-hide-mobile" style={{ padding: "13px 18px", fontSize: "0.8125rem", color: "oklch(0.42 0.003 264)", maxWidth: "200px" }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {a.propertyAddress.split(",")[0]}
                        </span>
                      </td>
                      <td style={{ padding: "13px 18px", fontSize: "0.875rem", fontWeight: 700, color: "oklch(0.20 0.004 264)", letterSpacing: "-0.01em" }}>
                        RM {a.monthlyRent.toLocaleString()}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <span className={s.pulse ? "pulse-dot" : ""} style={{
                          background: s.bg, color: s.fg,
                          padding: "3px 10px", borderRadius: "999px",
                          fontSize: "0.6875rem", fontWeight: 600,
                          whiteSpace: "nowrap", display: "inline-flex", alignItems: "center",
                        }}>{s.label}</span>
                      </td>
                      <td className="col-hide-mobile" style={{ padding: "13px 18px", fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", whiteSpace: "nowrap" }}>
                        {new Date(a.createdAt).toLocaleDateString("ms-MY", { day: "numeric", month: "short" })}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <Link href={`/dashboard/agreements/${a._id}`}>
                          <button style={{
                            background: "none", border: "none",
                            color: "oklch(0.55 0.14 40)",
                            fontSize: "0.8125rem", fontWeight: 600,
                            cursor: "pointer", padding: "4px 8px",
                            borderRadius: "6px",
                            transition: "background 120ms ease-out",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.55 0.14 40 / 0.08)")}
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
          </div>
        )}
      </div>
    </div>
  );
}
