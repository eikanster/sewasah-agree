"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAppUser } from "@/hooks/use-app-user";
import { Button } from "@/components/ui/button";
import { AgreementData } from "@/lib/generate-pdf";
import { useState } from "react";

export default function LawyerPage() {
  const { appUser } = useAppUser();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const pending = useQuery(
    api.agreements.listPendingReview,
    appUser?.firmId ? { firmId: appUser.firmId } : "skip"
  );

  const updateStatus = useMutation(api.agreements.updateStatus);

  const handleApprove = async (id: Id<"agreements">) => {
    if (!appUser?._id) return;
    setLoading(id);
    await updateStatus({
      id,
      status: "approved",
      approvedBy: appUser._id,
      lawyerNotes: notes[id] || undefined,
    });
    setLoading(null);
  };

  const handleRequestChanges = async (id: Id<"agreements">) => {
    setLoading(id);
    await updateStatus({
      id,
      status: "changes_requested",
      lawyerNotes: notes[id] || undefined,
    });
    setLoading(null);
  };

  const handlePreview = async (agreement: typeof pending extends (infer T)[] | null | undefined ? T : never) => {
    if (!agreement) return;
    const data: AgreementData = {
      agreementDate: new Date(agreement.createdAt).toISOString().split("T")[0],
      landlordName: agreement.landlordName,
      landlordIc: agreement.landlordIc,
      landlordPhone: agreement.landlordPhone,
      landlordEmail: agreement.landlordEmail,
      tenantName: agreement.tenantName,
      tenantIc: agreement.tenantIc,
      tenantPhone: agreement.tenantPhone,
      tenantEmail: agreement.tenantEmail,
      tenantIsForeigner: agreement.tenantIsForeigner,
      propertyAddress: agreement.propertyAddress,
      propertyType: agreement.propertyType,
      isFurnished: agreement.isFurnished,
      monthlyRent: agreement.monthlyRent,
      tenancyDuration: agreement.tenancyDuration,
      startDate: agreement.startDate,
      endDate: agreement.endDate,
      paymentDueDay: agreement.paymentDueDay,
      securityDeposit: agreement.securityDeposit,
      utilitiesDeposit: agreement.utilitiesDeposit,
      petsAllowed: agreement.petsAllowed,
      sublettingAllowed: agreement.sublettingAllowed,
      renovationAllowed: agreement.renovationAllowed,
      airconUnits: agreement.airconUnits,
      bankName: agreement.bankName,
      bankAccountNo: agreement.bankAccountNo,
      bankAccountName: agreement.bankAccountName,
      stampDuty: agreement.stampDuty,
    };
    const res = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const html = await res.text();
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-brand px-6 py-8 text-white">
        <p className="text-white/60 text-sm">Sewasah Agree</p>
        <h1 className="text-2xl font-bold mt-1">Pending Approval</h1>
        <p className="text-white/70 text-sm mt-1">
          {pending?.length ?? 0} agreement{(pending?.length ?? 0) !== 1 ? "s" : ""} waiting for your review
        </p>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
        {!pending || pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center">
            <p className="text-3xl mb-3">✅</p>
            <p className="font-semibold text-foreground">All clear!</p>
            <p className="text-sm text-muted-foreground mt-1">No agreements pending your review.</p>
          </div>
        ) : (
          pending.map((agreement) => (
            <div key={agreement._id} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              {/* Agreement Header */}
              <div className="p-5 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {agreement.landlordName} → {agreement.tenantName}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {agreement.propertyAddress.split(",")[0]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">RM {agreement.monthlyRent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex gap-3 mt-3">
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full">
                    {agreement.tenancyDuration / 12} Year{agreement.tenancyDuration > 12 ? "s" : ""}
                  </span>
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full capitalize">
                    {agreement.propertyType}
                  </span>
                  <span className="text-xs bg-muted px-2.5 py-1 rounded-full capitalize">
                    {agreement.isFurnished}
                  </span>
                  {agreement.tenantIsForeigner && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                      Foreigner
                    </span>
                  )}
                </div>
              </div>

              {/* AI Flags */}
              {agreement.aiFlags && agreement.aiFlags.length > 0 && (
                <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
                  <p className="text-xs font-semibold text-amber-800 mb-1.5">⚠️ AI Flags</p>
                  <ul className="space-y-1">
                    {agreement.aiFlags.map((flag, i) => (
                      <li key={i} className="text-xs text-amber-700">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Details */}
              <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-medium">{agreement.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <p className="font-medium">{agreement.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Security Deposit</p>
                  <p className="font-medium">RM {agreement.securityDeposit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stamp Duty</p>
                  <p className="font-medium">RM {agreement.stampDuty.toFixed(2)}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="px-5 py-4 border-b border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Notes (optional)</p>
                <textarea
                  value={notes[agreement._id] ?? ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [agreement._id]: e.target.value }))}
                  placeholder="Add notes or change requests here..."
                  rows={2}
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Actions */}
              <div className="px-5 py-4 flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-xs"
                  onClick={() => handlePreview(agreement)}
                >
                  👁 View Agreement
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleRequestChanges(agreement._id)}
                  disabled={loading === agreement._id}
                >
                  ✏️ Request Changes
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-xl text-xs gradient-brand text-white border-0"
                  onClick={() => handleApprove(agreement._id)}
                  disabled={loading === agreement._id}
                >
                  {loading === agreement._id ? "..." : "✅ Approve"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
