"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAppUser } from "@/hooks/use-app-user";
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
    await updateStatus({ id, status: "approved", approvedBy: appUser._id, lawyerNotes: notes[id] || undefined });
    setLoading(null);
  };

  const handleRequestChanges = async (id: Id<"agreements">) => {
    setLoading(id);
    await updateStatus({ id, status: "changes_requested", lawyerNotes: notes[id] || undefined });
    setLoading(null);
  };

  const handlePreview = async (agreement: typeof pending extends (infer T)[] | null | undefined ? T : never) => {
    if (!agreement) return;
    const data: AgreementData = {
      agreementDate: new Date(agreement.createdAt).toISOString().split("T")[0],
      landlordName: agreement.landlordName, landlordIc: agreement.landlordIc,
      landlordPhone: agreement.landlordPhone, landlordEmail: agreement.landlordEmail,
      tenantName: agreement.tenantName, tenantIc: agreement.tenantIc,
      tenantPhone: agreement.tenantPhone, tenantEmail: agreement.tenantEmail,
      tenantIsForeigner: agreement.tenantIsForeigner,
      propertyAddress: agreement.propertyAddress, propertyType: agreement.propertyType,
      isFurnished: agreement.isFurnished, monthlyRent: agreement.monthlyRent,
      tenancyDuration: agreement.tenancyDuration, startDate: agreement.startDate,
      endDate: agreement.endDate, paymentDueDay: agreement.paymentDueDay,
      securityDeposit: agreement.securityDeposit, utilitiesDeposit: agreement.utilitiesDeposit,
      petsAllowed: agreement.petsAllowed, sublettingAllowed: agreement.sublettingAllowed,
      renovationAllowed: agreement.renovationAllowed, airconUnits: agreement.airconUnits,
      bankName: agreement.bankName, bankAccountNo: agreement.bankAccountNo,
      bankAccountName: agreement.bankAccountName, stampDuty: agreement.stampDuty,
    };
    const res = await fetch("/api/generate-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const html = await res.text();
    window.open(URL.createObjectURL(new Blob([html], { type: "text/html" })), "_blank");
  };

  return (
    <div className="page-enter" style={{ maxWidth: "720px" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "6px" }}>
          Semakan Peguam
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", color: "oklch(0.13 0.025 45)", margin: 0 }}>
          Menunggu Kelulusan
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "oklch(0.55 0.025 50)", marginTop: "6px" }}>
          {pending?.length ?? 0} perjanjian menunggu semakan anda
        </p>
      </div>

      {/* Empty state */}
      {(!pending || pending.length === 0) && (
        <div style={{
          background: "oklch(0.975 0.010 58)",
          border: "1.5px solid oklch(0.875 0.016 55)",
          borderRadius: "20px", padding: "64px 40px",
          textAlign: "center",
          boxShadow: "0 1px 3px oklch(0.14 0.038 43 / 0.06)",
        }}>
          <div style={{
            width: "56px", height: "56px", margin: "0 auto 16px",
            background: "oklch(0.900 0.068 148)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem",
          }}>✓</div>
          <p style={{ fontWeight: 700, fontSize: "1rem", color: "oklch(0.22 0.035 45)" }}>Semua selesai!</p>
          <p style={{ fontSize: "0.875rem", color: "oklch(0.55 0.025 50)", marginTop: "4px" }}>
            Tiada perjanjian menunggu semakan anda.
          </p>
        </div>
      )}

      {/* Agreement cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {pending?.map((a) => (
          <div key={a._id} style={{
            background: "oklch(0.975 0.010 58)",
            border: "1.5px solid oklch(0.875 0.016 55)",
            borderRadius: "20px", overflow: "hidden",
            boxShadow: "0 1px 3px oklch(0.14 0.038 43 / 0.06), inset 0 1px 0 oklch(0.99 0.005 58 / 0.7)",
          }}>

            {/* Card header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid oklch(0.895 0.014 56)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "1rem", color: "oklch(0.13 0.025 45)", margin: 0 }}>
                  {a.landlordName} → {a.tenantName}
                </p>
                <p style={{ fontSize: "0.875rem", color: "oklch(0.55 0.025 50)", marginTop: "4px" }}>
                  {a.propertyAddress.split(",")[0]}
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                  {[
                    `${a.tenancyDuration / 12} Tahun`,
                    a.propertyType === "apartment" ? "Apartment" : a.propertyType === "landed" ? "Landed" : a.propertyType === "room" ? "Bilik" : "Komersial",
                    a.isFurnished === "furnished" ? "Perabot Lengkap" : a.isFurnished === "partially" ? "Separa" : "Tanpa Perabot",
                  ].map(tag => (
                    <span key={tag} style={{
                      fontSize: "0.75rem", fontWeight: 500,
                      background: "oklch(0.910 0.014 56)",
                      color: "oklch(0.42 0.025 50)",
                      padding: "3px 10px", borderRadius: "999px",
                    }}>{tag}</span>
                  ))}
                  {a.tenantIsForeigner && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 500, background: "oklch(0.910 0.050 292)", color: "oklch(0.36 0.105 292)", padding: "3px 10px", borderRadius: "999px" }}>
                      Warga Asing
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontWeight: 800, fontSize: "1.25rem", color: "oklch(0.55 0.14 40)", letterSpacing: "-0.02em", margin: 0 }}>
                  RM {a.monthlyRent.toLocaleString()}
                </p>
                <p style={{ fontSize: "0.75rem", color: "oklch(0.60 0.020 50)" }}>/bulan</p>
              </div>
            </div>

            {/* AI flags */}
            {a.aiFlags && a.aiFlags.length > 0 && (
              <div style={{ padding: "14px 24px", background: "oklch(0.93 0.065 72 / 0.35)", borderBottom: "1px solid oklch(0.88 0.07 72 / 0.4)" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "oklch(0.38 0.12 65)", marginBottom: "6px" }}>⚠️ Bendera AI</p>
                {a.aiFlags.map((f, i) => (
                  <p key={i} style={{ fontSize: "0.8125rem", color: "oklch(0.45 0.10 65)", margin: "2px 0" }}>• {f}</p>
                ))}
              </div>
            )}

            {/* Key details */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid oklch(0.895 0.014 56)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
              {[
                { label: "Tarikh Mula", value: a.startDate },
                { label: "Tarikh Tamat", value: a.endDate },
                { label: "Deposit Keselamatan", value: `RM ${a.securityDeposit.toLocaleString()}` },
                { label: "Duti Setem", value: `RM ${a.stampDuty.toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "oklch(0.60 0.020 50)", marginBottom: "4px" }}>{label}</p>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "oklch(0.22 0.035 45)" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid oklch(0.895 0.014 56)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "oklch(0.60 0.020 50)", marginBottom: "8px" }}>
                Nota (pilihan)
              </p>
              <textarea
                value={notes[a._id] ?? ""}
                onChange={e => setNotes(p => ({ ...p, [a._id]: e.target.value }))}
                placeholder="Tambah nota atau permintaan pindaan di sini..."
                rows={2}
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "1.5px solid oklch(0.875 0.016 55)",
                  borderRadius: "10px", fontSize: "0.875rem",
                  color: "oklch(0.13 0.025 45)",
                  background: "oklch(0.99 0.005 58)",
                  resize: "none", outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 150ms ease-out",
                }}
                onFocus={e => (e.target.style.borderColor = "oklch(0.55 0.14 40)")}
                onBlur={e => (e.target.style.borderColor = "oklch(0.875 0.016 55)")}
              />
            </div>

            {/* Actions */}
            <div style={{ padding: "16px 24px", display: "flex", gap: "10px" }}>
              <button onClick={() => handlePreview(a)}
                className="btn-ghost"
                style={{ flex: 1, fontSize: "0.875rem", padding: "10px" }}>
                👁 Lihat Perjanjian
              </button>
              <button
                onClick={() => handleRequestChanges(a._id)}
                disabled={loading === a._id}
                style={{
                  background: "oklch(0.93 0.06 27 / 0.15)",
                  color: "oklch(0.48 0.18 27)",
                  border: "1.5px solid oklch(0.85 0.08 27 / 0.5)",
                  borderRadius: "12px", padding: "10px 16px",
                  fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
                  transition: "all 150ms ease-out",
                }}>
                ✏️ Pindaan
              </button>
              <button
                onClick={() => handleApprove(a._id)}
                disabled={loading === a._id}
                className="btn-brand"
                style={{ flex: 1, fontSize: "0.875rem", padding: "10px" }}>
                {loading === a._id ? "Memproses..." : "✓ Luluskan"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
