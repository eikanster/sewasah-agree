"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAppUser } from "@/hooks/use-app-user";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft:             { label: "Draft",           color: "bg-gray-100 text-gray-600" },
  pending_review:    { label: "Pending Review",  color: "bg-amber-100 text-amber-700" },
  changes_requested: { label: "Changes Needed",  color: "bg-red-100 text-red-700" },
  approved:          { label: "Approved",         color: "bg-blue-100 text-blue-700" },
  pending_stamp:     { label: "Awaiting Stamp",  color: "bg-purple-100 text-purple-700" },
  stamped:           { label: "Stamped",          color: "bg-teal-100 text-teal-700" },
  completed:         { label: "Completed",        color: "bg-green-100 text-green-700" },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning 👋";
  if (h < 17) return "Good afternoon 👋";
  return "Good evening 👋";
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

  const statCards = [
    { label: "Pending Review", value: counts?.pendingReview ?? 0, emoji: "⏳", color: "from-amber-400 to-orange-400" },
    { label: "Awaiting Stamp", value: counts?.pendingStamp ?? 0, emoji: "📮", color: "from-purple-400 to-violet-400" },
    { label: "Completed",      value: counts?.completed ?? 0,     emoji: "✅", color: "from-teal-400 to-cyan-400" },
    { label: "This Month",     value: counts?.totalThisMonth ?? 0, emoji: "📋", color: "from-blue-400 to-indigo-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting()}</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening today.</p>
        </div>
        <Link href="/dashboard/agreements/new">
          <Button className="gradient-brand text-white border-0 shadow-md rounded-xl px-5">
            + New Agreement
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card-hover bg-white rounded-2xl p-5 shadow-sm border border-border">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-lg mb-3`}>
              {card.emoji}
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Agreements Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-semibold text-foreground">All Agreements</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage and track tenancy agreements</p>
        </div>

        {!agreements || agreements.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">📄</p>
            <p className="font-medium text-foreground">No agreements yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first tenancy agreement to get started.</p>
            <Link href="/dashboard/agreements/new">
              <Button className="gradient-brand text-white border-0">+ New Agreement</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Landlord</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tenant</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Property</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rent</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((a) => (
                <TableRow key={a._id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-sm">{a.landlordName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.tenantName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.propertyAddress.split(",")[0]}</TableCell>
                  <TableCell className="text-sm font-medium">RM {a.monthlyRent.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[a.status]?.color}`}>
                      {statusConfig[a.status]?.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString("en-MY")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/agreements/${a._id}`}>
                      <Button variant="ghost" size="sm" className="text-xs rounded-lg hover:bg-muted">
                        View →
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
