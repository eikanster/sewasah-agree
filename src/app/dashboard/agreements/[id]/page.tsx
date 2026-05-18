"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { AgreementData } from "@/lib/generate-pdf";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft:             { label: "Draft",           color: "bg-gray-100 text-gray-600" },
  pending_review:    { label: "Pending Review",  color: "bg-amber-100 text-amber-700" },
  changes_requested: { label: "Changes Needed",  color: "bg-red-100 text-red-700" },
  approved:          { label: "Approved",         color: "bg-blue-100 text-blue-700" },
  pending_stamp:     { label: "Awaiting Stamp",  color: "bg-purple-100 text-purple-700" },
  stamped:           { label: "Stamped",          color: "bg-teal-100 text-teal-700" },
  completed:         { label: "Completed",        color: "bg-green-100 text-green-700" },
};

const statusFlow = ["draft", "pending_review", "approved", "pending_stamp", "stamped", "completed"];

export default function AgreementDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const agreement = useQuery(api.agreements.getById, {
    id: id as Id<"agreements">,
  });
  const updateStatus = useMutation(api.agreements.updateStatus);

  if (!agreement) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        Loading...
      </div>
    );
  }

  const currentIndex = statusFlow.indexOf(agreement.status);
  const nextStatus = statusFlow[currentIndex + 1] as typeof agreement.status | undefined;

  const handleNextStatus = async () => {
    if (!nextStatus) return;
    await updateStatus({ id: agreement._id, status: nextStatus });
  };

  const handleReset = async () => {
    await updateStatus({ id: agreement._id, status: "pending_review" });
  };

  const handlePreview = async () => {
    const data: AgreementData = {
      agreementRef: agreement.agreementRef,
      agreementDate: new Date(agreement.createdAt).toISOString().split("T")[0],
      landlordName: agreement.landlordName,
      landlordIc: agreement.landlordIc,
      landlordPhone: agreement.landlordPhone,
      landlordEmail: agreement.landlordEmail,
      landlordAddress: agreement.landlordAddress ?? "",
      tenantName: agreement.tenantName,
      tenantIc: agreement.tenantIc,
      tenantPhone: agreement.tenantPhone,
      tenantEmail: agreement.tenantEmail,
      tenantAddress: agreement.tenantAddress ?? "",
      tenantIsForeigner: agreement.tenantIsForeigner,
      propertyAddress: agreement.propertyAddress,
      propertyType: agreement.propertyType,
      useOfPremises: (agreement.useOfPremises ?? "residential") as "residential" | "commercial",
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
      propertyLegalDesc: agreement.propertyLegalDesc,
      bankName: agreement.bankName,
      bankAccountNo: agreement.bankAccountNo,
      bankAccountName: agreement.bankAccountName,
      maintenanceFee: agreement.maintenanceFee,
      stampDuty: agreement.stampDuty,
    };

    const res = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, agreementType: agreement.agreementType ?? "residential" }),
    });
    const html = await res.text();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const nextLabel: Record<string, string> = {
    draft: "Send for Lawyer Review →",
    pending_review: "Mark as Approved →",
    approved: "Submit for Stamping →",
    pending_stamp: "Mark as Stamped →",
    stamped: "Mark as Completed →",
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground text-sm">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-foreground">
            {agreement.landlordName} → {agreement.tenantName}
          </h1>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[agreement.status]?.color}`}>
          {statusConfig[agreement.status]?.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Progress</p>
        <div className="flex items-center gap-0">
          {statusFlow.map((s, i) => {
            const done = i <= currentIndex;
            const active = i === currentIndex;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                  ${active ? "bg-primary text-white ring-4 ring-primary/20" : done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {done && !active ? "✓" : i + 1}
                </div>
                {i < statusFlow.length - 1 && (
                  <div className={`h-0.5 flex-1 ${i < currentIndex ? "bg-green-500" : "bg-gray-100"}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          {["Draft", "Review", "Approved", "Stamp", "Stamped", "Done"].map((label, i) => (
            <span key={i} className={`text-xs ${i === currentIndex ? "text-primary font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* AI Flags */}
      {agreement.aiFlags && agreement.aiFlags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-medium text-amber-800 mb-2 text-sm">⚠️ AI Flags</p>
          <ul className="space-y-1">
            {agreement.aiFlags.map((flag, i) => (
              <li key={i} className="text-sm text-amber-700">• {flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Landlord */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Landlord</p>
          <div>
            <p className="font-semibold text-foreground">{agreement.landlordName}</p>
            <p className="text-sm text-muted-foreground">{agreement.landlordIc}</p>
            <p className="text-sm text-muted-foreground">{agreement.landlordPhone}</p>
            {agreement.landlordEmail && <p className="text-sm text-muted-foreground">{agreement.landlordEmail}</p>}
          </div>
        </div>

        {/* Tenant */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tenant</p>
          <div>
            <p className="font-semibold text-foreground">{agreement.tenantName}</p>
            <p className="text-sm text-muted-foreground">{agreement.tenantIc}</p>
            <p className="text-sm text-muted-foreground">{agreement.tenantPhone}</p>
            {agreement.tenantIsForeigner && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                Foreigner
              </span>
            )}
          </div>
        </div>

        {/* Property */}
        <div className="bg-white rounded-2xl border border-border p-5 col-span-2 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Property</p>
          <p className="font-medium text-foreground">{agreement.propertyAddress}</p>
          <div className="flex gap-2">
            <span className="text-xs bg-muted px-2 py-1 rounded-full capitalize">{agreement.propertyType}</span>
            <span className="text-xs bg-muted px-2 py-1 rounded-full capitalize">{agreement.isFurnished}</span>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tenancy Terms</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Rent</span>
              <span className="font-semibold">RM {agreement.monthlyRent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{agreement.tenancyDuration} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start</span>
              <span className="font-medium">{agreement.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End</span>
              <span className="font-medium">{agreement.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span className="font-medium">{agreement.paymentDueDay}th of month</span>
            </div>
          </div>
        </div>

        {/* Deposits & Fees */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deposits & Fees</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Deposit</span>
              <span className="font-medium">RM {agreement.securityDeposit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Utilities Deposit</span>
              <span className="font-medium">RM {agreement.utilitiesDeposit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-1.5 mt-1.5">
              <span className="text-muted-foreground">Stamp Duty</span>
              <span className="font-semibold text-primary">RM {agreement.stampDuty.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-2xl border border-border p-5 col-span-2 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bank Details (Rental Payment)</p>
          <p className="text-sm font-medium">{agreement.bankName} — {agreement.bankAccountNo}</p>
          <p className="text-sm text-muted-foreground">{agreement.bankAccountName}</p>
        </div>
      </div>

      {/* Reset status — dev/admin tool */}
      {agreement.status !== "pending_review" && agreement.status !== "draft" && (
        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-red-500 underline underline-offset-2 transition-colors"
          >
            ↩ Reset to Pending Review
          </button>
        </div>
      )}

      {/* Preview Agreement */}
      <div className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground text-sm">Agreement Document</p>
          <p className="text-xs text-muted-foreground mt-0.5">Preview the generated tenancy agreement</p>
        </div>
        <Button onClick={handlePreview} variant="outline" className="rounded-xl">
          👁 Preview Agreement
        </Button>
      </div>

      {/* Action Button */}
      {nextStatus && agreement.status !== "approved" && (
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground text-sm">Next Step</p>
            <p className="text-xs text-muted-foreground mt-0.5">Move this agreement to the next stage</p>
          </div>
          <Button onClick={handleNextStatus} className="gradient-brand text-white border-0 rounded-xl">
            {nextLabel[agreement.status] ?? "Next →"}
          </Button>
        </div>
      )}

      {/* Stamping shortcut when approved */}
      {agreement.status === "approved" && (
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground text-sm">Ready for Stamping</p>
            <p className="text-xs text-muted-foreground mt-0.5">Agreement approved — proceed to stamp with eDutiSetem</p>
          </div>
          <Button
            onClick={async () => {
              await updateStatus({ id: agreement._id, status: "pending_stamp" });
              router.push(`/dashboard/agreements/${agreement._id}/stamp`);
            }}
            className="gradient-brand text-white border-0 rounded-xl"
          >
            📮 Go to Stamping →
          </Button>
        </div>
      )}

      {agreement.status === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-semibold text-green-800">Agreement Completed</p>
          <p className="text-sm text-green-600 mt-1">All done — stamped and delivered to all parties.</p>
        </div>
      )}
    </div>
  );
}
