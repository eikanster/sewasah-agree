"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAppUser } from "@/hooks/use-app-user";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const statusMap: Record<string, { label: string; cls: string }> = {
  draft:             { label: "Draft",          cls: "status-draft" },
  pending_review:    { label: "Pending Review", cls: "status-pending" },
  changes_requested: { label: "Changes Needed", cls: "status-review" },
  approved:          { label: "Approved",        cls: "status-approved" },
  pending_stamp:     { label: "Awaiting Stamp", cls: "status-stamp" },
  stamped:           { label: "Stamped",         cls: "status-approved" },
  completed:         { label: "Completed",       cls: "status-completed" },
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

  const stats = [
    { label: "Pending Review", value: counts?.pendingReview ?? 0, hint: "Waiting for lawyer" },
    { label: "Awaiting Stamp", value: counts?.pendingStamp ?? 0, hint: "Ready to submit" },
    { label: "Completed",      value: counts?.completed ?? 0,     hint: "This month" },
    { label: "Total",          value: counts?.totalThisMonth ?? 0, hint: "Agreements this month" },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "oklch(0.13 0.025 45)", letterSpacing: "-0.01em" }}>
            {greeting()}
          </h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.48 0.025 50)" }}>
            {appUser?.name ?? "Welcome back"}
          </p>
        </div>
        <Link href="/dashboard/agreements/new">
          <Button className="text-sm font-medium rounded-xl px-5 py-2.5 transition-all duration-150"
            style={{ background: "oklch(0.55 0.14 40)", color: "oklch(0.99 0.005 58)", border: "none" }}>
            + New Agreement
          </Button>
        </Link>
      </div>

      {/* Stats — horizontal strip, not a card grid */}
      <div className="grid grid-cols-4 gap-px rounded-2xl overflow-hidden"
        style={{ background: "oklch(0.87 0.016 55)", border: "1px solid oklch(0.87 0.016 55)" }}>
        {stats.map((s, i) => (
          <div key={i} className="px-6 py-5" style={{ background: "oklch(0.97 0.012 58)" }}>
            <p className="text-3xl font-bold" style={{ color: "oklch(0.13 0.025 45)", letterSpacing: "-0.02em" }}>
              {s.value}
            </p>
            <p className="text-sm font-medium mt-1" style={{ color: "oklch(0.28 0.04 45)" }}>{s.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.025 50)" }}>{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Agreements */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.87 0.016 55)" }}>
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: "oklch(0.97 0.012 58)", borderBottom: "1px solid oklch(0.87 0.016 55)" }}>
          <p className="font-semibold text-sm" style={{ color: "oklch(0.13 0.025 45)" }}>
            Agreements
          </p>
          <p className="text-xs" style={{ color: "oklch(0.55 0.025 50)" }}>
            {agreements?.length ?? 0} total
          </p>
        </div>

        {!agreements || agreements.length === 0 ? (
          <div className="py-16 text-center" style={{ background: "oklch(0.97 0.012 58)" }}>
            <p className="text-4xl mb-3">📄</p>
            <p className="font-semibold text-sm" style={{ color: "oklch(0.28 0.04 45)" }}>No agreements yet</p>
            <p className="text-sm mt-1 mb-5" style={{ color: "oklch(0.55 0.025 50)" }}>
              Create the first one to get started.
            </p>
            <Link href="/dashboard/agreements/new">
              <Button className="text-sm rounded-xl px-5"
                style={{ background: "oklch(0.55 0.14 40)", color: "oklch(0.99 0.005 58)", border: "none" }}>
                + New Agreement
              </Button>
            </Link>
          </div>
        ) : (
          <div style={{ background: "oklch(0.99 0.005 58)" }}>
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: "1px solid oklch(0.87 0.016 55)" }}>
                  {["Landlord", "Tenant", "Property", "Rent", "Status", "Date", ""].map((h) => (
                    <TableHead key={h} className="text-xs font-medium uppercase tracking-widest"
                      style={{ color: "oklch(0.55 0.025 50)", paddingTop: "12px", paddingBottom: "12px" }}>
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreements.map((a) => {
                  const s = statusMap[a.status] ?? { label: a.status, cls: "status-draft" };
                  return (
                    <TableRow key={a._id}
                      className="transition-colors duration-100"
                      style={{ borderBottom: "1px solid oklch(0.90 0.014 56)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.94 0.018 58)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}>
                      <TableCell className="font-medium text-sm py-4"
                        style={{ color: "oklch(0.13 0.025 45)" }}>{a.landlordName}</TableCell>
                      <TableCell className="text-sm py-4"
                        style={{ color: "oklch(0.48 0.025 50)" }}>{a.tenantName}</TableCell>
                      <TableCell className="text-sm py-4"
                        style={{ color: "oklch(0.48 0.025 50)" }}>{a.propertyAddress.split(",")[0]}</TableCell>
                      <TableCell className="text-sm font-medium py-4"
                        style={{ color: "oklch(0.28 0.04 45)" }}>
                        RM {a.monthlyRent.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`${s.cls} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                          {s.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs py-4" style={{ color: "oklch(0.55 0.025 50)" }}>
                        {new Date(a.createdAt).toLocaleDateString("en-MY")}
                      </TableCell>
                      <TableCell className="py-4">
                        <Link href={`/dashboard/agreements/${a._id}`}>
                          <button className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-100"
                            style={{ color: "oklch(0.55 0.14 40)" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.93 0.06 40 / 0.15)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "")}>
                            View →
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
