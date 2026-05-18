"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgreementData } from "@/lib/generate-pdf";

export default function StampPage() {
  const { id } = useParams();
  const router = useRouter();
  const agreement = useQuery(api.agreements.getById, {
    id: id as Id<"agreements">,
  });
  const updateStatus = useMutation(api.agreements.updateStatus);
  const [confirming, setConfirming] = useState(false);

  if (!agreement) {
    return (
      <div className="flex items-center justify-center py-32 text-muted-foreground">
        Loading...
      </div>
    );
  }

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
      propertyLegalDesc: agreement.propertyLegalDesc,
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
      maintenanceFee: agreement.maintenanceFee,
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

  const handleMarkStamped = async () => {
    await updateStatus({ id: agreement._id, status: "stamped" });
    setConfirming(false);
  };

  const handleMarkCompleted = async () => {
    await updateStatus({ id: agreement._id, status: "completed" });

    // Send notification emails
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementRef: agreement.agreementRef ?? `SA-${agreement._id.slice(-6).toUpperCase()}`,
          landlordName: agreement.landlordName,
          landlordEmail: agreement.landlordEmail,
          tenantName: agreement.tenantName,
          tenantEmail: agreement.tenantEmail,
          propertyAddress: agreement.propertyAddress,
          monthlyRent: agreement.monthlyRent,
          startDate: agreement.startDate,
          endDate: agreement.endDate,
          stampDuty: agreement.stampDuty,
        }),
      });
    } catch (e) {
      console.error("Email send failed:", e);
    }

    router.push(`/dashboard/agreements/${id}`);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground text-sm">
          ← Back
        </button>
        <h1 className="text-xl font-bold text-foreground">Stamping & Delivery</h1>
      </div>

      {/* Agreement Summary */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Agreement</p>
        <p className="font-semibold text-foreground">{agreement.landlordName} → {agreement.tenantName}</p>
        <p className="text-sm text-muted-foreground">{agreement.propertyAddress.split(",")[0]}</p>
        <div className="flex gap-4 mt-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Monthly Rent</p>
            <p className="font-semibold">RM {agreement.monthlyRent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Stamp Duty</p>
            <p className="font-semibold text-primary">RM {agreement.stampDuty.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">eDutiSetem Fee</p>
            <p className="font-semibold">RM 10.00</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Service Fee</p>
            <p className="font-semibold text-green-600">RM 50.00</p>
          </div>
        </div>
      </div>

      {/* Step 1 — Download */}
      <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
          <div>
            <p className="font-medium text-foreground">Download Agreement PDF</p>
            <p className="text-xs text-muted-foreground">Download the approved agreement to submit to eDutiSetem</p>
          </div>
        </div>
        <Button onClick={handlePreview} variant="outline" className="w-full rounded-xl">
          👁 Preview & Download Agreement
        </Button>
      </div>

      {/* Step 2 — Submit to eDutiSetem */}
      <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
          <div>
            <p className="font-medium text-foreground">Submit to eDutiSetem</p>
            <p className="text-xs text-muted-foreground">Upload the agreement to eDutiSetem for LHDN stamping (RM10 + stamp duty)</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-2">
          <p className="font-medium text-blue-800">Stamp Duty Breakdown</p>
          <div className="space-y-1 text-blue-700">
            <div className="flex justify-between">
              <span>Stamp Duty</span>
              <span className="font-medium">RM {agreement.stampDuty.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>eDutiSetem Processing</span>
              <span className="font-medium">RM 10.00</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
              <span className="font-semibold">Total to Pay eDutiSetem</span>
              <span className="font-bold">RM {(agreement.stampDuty + 10).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <a
          href="https://mystamps.my"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          🔗 Open eDutiSetem.my →
        </a>
      </div>

      {/* Step 3 — Mark Stamped */}
      <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
            ${agreement.status === "stamped" || agreement.status === "completed" ? "bg-green-500 text-white" : "bg-primary text-white"}`}>
            {agreement.status === "stamped" || agreement.status === "completed" ? "✓" : "3"}
          </div>
          <div>
            <p className="font-medium text-foreground">Confirm Stamping Done</p>
            <p className="text-xs text-muted-foreground">Once eDutiSetem returns the stamped document, confirm here</p>
          </div>
        </div>

        {agreement.status === "pending_stamp" && (
          confirming ? (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                ⚠️ Confirm that you have received the stamped document from eDutiSetem before proceeding.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-xl gradient-brand text-white border-0" onClick={handleMarkStamped}>
                  Yes, Stamped ✅
                </Button>
              </div>
            </div>
          ) : (
            <Button className="w-full rounded-xl gradient-brand text-white border-0" onClick={() => setConfirming(true)}>
              Mark as Stamped
            </Button>
          )
        )}

        {(agreement.status === "stamped" || agreement.status === "completed") && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
            ✅ Document has been stamped successfully.
          </div>
        )}
      </div>

      {/* Step 4 — Deliver */}
      <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
            ${agreement.status === "completed" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
            {agreement.status === "completed" ? "✓" : "4"}
          </div>
          <div>
            <p className="font-medium text-foreground">Deliver to All Parties</p>
            <p className="text-xs text-muted-foreground">Send stamped agreement to landlord and tenant</p>
          </div>
        </div>

        {agreement.status === "stamped" && (
          <div className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between bg-muted rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium">Landlord — {agreement.landlordName}</p>
                  <p className="text-xs text-muted-foreground">{agreement.landlordPhone}{agreement.landlordEmail ? " · " + agreement.landlordEmail : ""}</p>
                </div>
                <span className="text-green-600 text-xs">📱 WhatsApp</span>
              </div>
              <div className="flex items-center justify-between bg-muted rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium">Tenant — {agreement.tenantName}</p>
                  <p className="text-xs text-muted-foreground">{agreement.tenantPhone}{agreement.tenantEmail ? " · " + agreement.tenantEmail : ""}</p>
                </div>
                <span className="text-green-600 text-xs">📱 WhatsApp</span>
              </div>
            </div>

            {/* WhatsApp links */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/60${agreement.landlordPhone.replace(/^0/, "")}?text=${encodeURIComponent(`Salam ${agreement.landlordName}, perjanjian sewaan anda telah pun distamp. Sila hubungi kami untuk mendapatkan salinan dokumen.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors"
              >
                📱 WhatsApp Landlord
              </a>
              <a
                href={`https://wa.me/60${agreement.tenantPhone.replace(/^0/, "")}?text=${encodeURIComponent(`Salam ${agreement.tenantName}, perjanjian sewaan anda telah pun distamp. Sila hubungi kami untuk mendapatkan salinan dokumen.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors"
              >
                📱 WhatsApp Tenant
              </a>
            </div>

            <Button
              className="w-full rounded-xl gradient-brand text-white border-0"
              onClick={handleMarkCompleted}
            >
              🎉 Mark as Completed
            </Button>
          </div>
        )}

        {agreement.status === "completed" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-semibold text-green-800">Agreement Completed!</p>
            <p className="text-xs text-green-600 mt-1">Delivered to all parties successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
}
