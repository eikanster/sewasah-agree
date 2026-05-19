"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAppUser } from "@/hooks/use-app-user";

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcStampDuty(monthlyRent: number, durationMonths: number): number {
  const annual = monthlyRent * 12;
  const taxable = annual - 2400;
  if (taxable <= 0) return 0;
  const rate = durationMonths > 36 ? 2 : 1;
  return Math.ceil((taxable / 250) * rate * 100) / 100;
}

function calcEndDate(start: string, months: number): string {
  if (!start) return "";
  const d = new Date(start);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function aiFlags(form: Record<string, unknown>): string[] {
  const f: string[] = [];
  if (!form.petsAllowed) f.push("Pet clause tidak disertakan — tiada haiwan peliharaan disahkan");
  if (form.tenantIsForeigner) f.push("Klausa ekspatriat diaktifkan — penyewa warga asing");
  if (form.isFurnished !== "unfurnished") f.push("Unit berperabot — senarai inventori perlu dilampirkan");
  if ((form.airconUnits as number) > 0) f.push(`${form.airconUnits} unit penghawa dingin — klausa penyelenggaraan disertakan`);
  return f;
}

// ─── Validation ───────────────────────────────────────────────────────────

type FormErrors = Record<string, string>;

function validateStep(step: number, form: Record<string, unknown>, templateType: string): FormErrors {
  const errors: FormErrors = {};
  const req = (key: string, label: string) => {
    if (!form[key] || String(form[key]).trim() === "") errors[key] = `${label} diperlukan`;
  };
  const icFormat = (key: string, label: string) => {
    const val = String(form[key] ?? "").replace(/-/g, "");
    if (val && !/^\d{12}$/.test(val)) errors[key] = `${label} mesti 12 digit (cth. 820122025032)`;
  };
  const phoneFormat = (key: string, label: string) => {
    const val = String(form[key] ?? "");
    if (val && !/^[0-9+\-\s]{8,15}$/.test(val)) errors[key] = `${label} tidak sah`;
  };

  if (step === 1) {
    req("landlordName",    "Nama tuan rumah");
    req("landlordIc",     "No. IC tuan rumah");
    req("landlordPhone",  "No. telefon tuan rumah");
    req("landlordAddress","Alamat tuan rumah");
    req("tenantName",     "Nama penyewa");
    req("tenantIc",       "No. IC penyewa");
    req("tenantPhone",    "No. telefon penyewa");
    req("tenantAddress",  "Alamat penyewa");
    icFormat("landlordIc", "No. IC tuan rumah");
    icFormat("tenantIc",   "No. IC penyewa");
    phoneFormat("landlordPhone", "No. telefon tuan rumah");
    phoneFormat("tenantPhone",   "No. telefon penyewa");
  }
  if (step === 2) {
    req("propertyAddress", "Alamat hartanah");
    if (templateType === "room") req("roomIdentifier", "Pengenalan bilik");
  }
  if (step === 3) {
    req("monthlyRent", "Sewa bulanan");
    req("startDate",   "Tarikh mula");
    if (parseFloat(String(form.monthlyRent)) <= 0) errors.monthlyRent = "Sewa mesti lebih dari RM 0";
  }
  if (step === 4) {
    req("bankName",        "Nama bank");
    req("bankAccountNo",   "No. akaun");
    req("bankAccountName", "Nama akaun");
  }
  return errors;
}

// ─── Styled Input ─────────────────────────────────────────────────────────

function Field({ label, children, hint, error }: { label: string; children: React.ReactNode; hint?: string; error?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {error && (
        <p style={{ fontSize: "0.75rem", color: "oklch(0.48 0.18 27)", margin: "0 0 2px", fontWeight: 500 }}>
          ⚠ {error}
        </p>
      )}
      <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.28 0.003 264)" }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)" }}>{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid oklch(0.876 0.003 264)",
  borderRadius: "10px",
  fontSize: "0.9375rem",
  color: "oklch(0.09 0.006 264)",
  background: "oklch(0.998 0 0)",
  outline: "none",
  transition: "border-color 150ms ease-out, box-shadow 150ms ease-out",
  boxSizing: "border-box",
};

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? "oklch(0.55 0.14 40)" : "oklch(0.876 0.003 264)",
        boxShadow: focused ? "0 0 0 3px oklch(0.55 0.14 40 / 0.12)" : "none",
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputStyle,
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a08060' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: "40px",
        borderColor: focused ? "oklch(0.55 0.14 40)" : "oklch(0.876 0.003 264)",
        boxShadow: focused ? "0 0 0 3px oklch(0.55 0.14 40 / 0.12)" : "none",
      }}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────

function StepCard({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      background: "oklch(0.998 0 0)",
      border: "1.5px solid oklch(0.876 0.003 264)",
      borderRadius: "20px",
      padding: "32px 36px",
      animation: "pageIn 260ms cubic-bezier(0.16,1,0.3,1) both",
      boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05), inset 0 1px 0 oklch(0.998 0 0 / 0.8)",
    }}>
      {children}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────

const STEPS = ["Pihak", "Hartanah", "Terma", "Syarat", "Semak"];

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
      {STEPS.map((label, i) => {
        const done = i < step - 1;
        const active = i === step - 1;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "32px", height: "32px",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8125rem", fontWeight: 700,
                background: done ? "oklch(0.42 0.09 145)" : active ? "oklch(0.55 0.14 40)" : "oklch(0.938 0.002 264)",
                color: done || active ? "oklch(0.998 0 0)" : "oklch(0.50 0.003 264)",
                boxShadow: active ? "0 0 0 4px oklch(0.55 0.14 40 / 0.18)" : "none",
                transition: "all 250ms cubic-bezier(0.16,1,0.3,1)",
                flexShrink: 0,
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: "0.6875rem", fontWeight: active ? 600 : 400,
                color: active ? "oklch(0.55 0.14 40)" : done ? "oklch(0.42 0.09 145)" : "oklch(0.56 0.003 264)",
                whiteSpace: "nowrap",
                transition: "color 250ms ease-out",
              }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "2px", margin: "0 6px", marginBottom: "20px",
                background: done ? "oklch(0.42 0.09 145)" : "oklch(0.938 0.002 264)",
                transition: "background 350ms ease-out",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label onClick={() => onChange(!checked)} style={{
      display: "flex", alignItems: "center", gap: "12px",
      cursor: "pointer", userSelect: "none",
      padding: "12px 16px",
      borderRadius: "12px",
      border: `1.5px solid ${checked ? "oklch(0.55 0.14 40)" : "oklch(0.876 0.003 264)"}`,
      background: checked ? "oklch(0.55 0.14 40 / 0.06)" : "oklch(0.998 0 0)",
      transition: "all 150ms ease-out",
    }}>
      <div style={{
        width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
        border: `2px solid ${checked ? "oklch(0.55 0.14 40)" : "oklch(0.75 0.020 50)"}`,
        background: checked ? "oklch(0.55 0.14 40)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 150ms ease-out",
        fontSize: "0.6875rem", color: "oklch(0.998 0 0)", fontWeight: 700,
      }}>
        {checked ? "✓" : ""}
      </div>
      <span style={{ fontSize: "0.875rem", color: "oklch(0.20 0.004 264)", fontWeight: checked ? 500 : 400 }}>
        {label}
      </span>
    </label>
  );
}

// ─── Summary Row ──────────────────────────────────────────────────────────

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid oklch(0.918 0.002 264)" }}>
      <span style={{ fontSize: "0.875rem", color: "oklch(0.50 0.003 264)" }}>{label}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: highlight ? 700 : 600, color: highlight ? "oklch(0.55 0.14 40)" : "oklch(0.09 0.006 264)" }}>{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

// ─── Template types ───────────────────────────────────────────────────────

type AgreementType = "residential" | "room" | "short_term" | "commercial";

const TEMPLATES: {
  type: AgreementType; label: string; labelMs: string;
  desc: string; icon: string; soon?: boolean;
}[] = [
  { type: "residential", label: "Standard Residential", labelMs: "Kediaman Standard",
    desc: "Sewaan unit penuh — apartment, rumah teres, banglo.", icon: "🏠" },
  { type: "room",        label: "Room Rental",          labelMs: "Bilik Sewa",
    desc: "Sewaan satu bilik sahaja dalam unit yang dikongsi.", icon: "🚪" },
  { type: "short_term",  label: "Short-Term",           labelMs: "Jangka Pendek",
    desc: "Tempoh 1–6 bulan, termasuk opsi utilities & internet.", icon: "📅" },
  { type: "commercial",  label: "Commercial / Shop",    labelMs: "Komersial / Kedai",
    desc: "Lot kedai, pejabat, ruang perniagaan.", icon: "🏪", soon: true },
];

// ─── Template Selector ────────────────────────────────────────────────────

function TemplateSelector({ onSelect }: { onSelect: (t: AgreementType) => void }) {
  return (
    <div style={{ maxWidth: "860px" }}>
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "6px" }}>
          Langkah pertama
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em",
          color: "oklch(0.09 0.006 264)", margin: 0 }}>
          Pilih Jenis Perjanjian
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "oklch(0.50 0.003 264)", marginTop: "6px" }}>
          Setiap jenis mempunyai klausa dan format yang berbeza.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {TEMPLATES.map(t => (
          <button key={t.type} onClick={() => !t.soon && onSelect(t.type)}
            disabled={t.soon}
            style={{
              background: t.soon ? "oklch(0.963 0.002 264)" : "oklch(0.998 0 0)",
              border: `1.5px solid ${t.soon ? "oklch(0.876 0.003 264)" : "oklch(0.876 0.003 264)"}`,
              borderRadius: "18px", padding: "28px",
              textAlign: "left", cursor: t.soon ? "not-allowed" : "pointer",
              opacity: t.soon ? 0.6 : 1,
              transition: "border-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out",
              boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05)",
            }}
            onMouseEnter={e => {
              if (!t.soon) {
                (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.55 0.14 40)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px oklch(0.55 0.14 40 / 0.12)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.876 0.003 264)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px oklch(0.12 0.006 264 / 0.05)";
              (e.currentTarget as HTMLElement).style.transform = "";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "2rem", lineHeight: 1 }}>{t.icon}</span>
              {t.soon && (
                <span style={{
                  fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "oklch(0.54 0.003 264)",
                  background: "oklch(0.938 0.002 264)", padding: "3px 8px", borderRadius: "999px",
                }}>Akan Datang</span>
              )}
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: "0 0 4px" }}>
              {t.labelMs}
            </p>
            <p style={{ fontSize: "0.75rem", color: "oklch(0.44 0.003 264)", fontWeight: 400, margin: 0, lineHeight: 1.5 }}>
              {t.label}
            </p>
            <p style={{ fontSize: "0.8125rem", color: "oklch(0.50 0.003 264)", margin: "10px 0 0", lineHeight: 1.5 }}>
              {t.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NewAgreementPage() {
  const router = useRouter();
  const { appUser } = useAppUser();
  const createAgreement = useMutation(api.agreements.create);
  const updateStatus = useMutation(api.agreements.updateStatus);
  const [templateType, setTemplateType] = useState<AgreementType | "">("");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const goToStep = (n: number) => {
    // Validate current step before advancing
    if (n > step) {
      const errs = validateStep(step, form as Record<string, unknown>, templateType);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
    }
    setErrors({});
    setStep(n);
    const el = document.getElementById("main-scroll");
    if (el) el.scrollTop = 0;
  };

  const [form, setForm] = useState({
    landlordName: "", landlordIc: "", landlordPhone: "", landlordEmail: "",
    landlordAddress: "",
    tenantName: "", tenantIc: "", tenantPhone: "", tenantEmail: "",
    tenantAddress: "",
    tenantIsForeigner: false,
    propertyAddress: "", propertyType: "apartment",
    useOfPremises: "residential", isFurnished: "unfurnished",
    propertyLegalDesc: "",
    // Room rental
    roomIdentifier: "",
    utilitiesHandling: "split",
    wifiIncluded: true,
    waterIncluded: true,
    latePaymentInterest: "1.5",
    meterReading: "",
    rentFreePeriod: "0",
    // Short-term
    utilitiesIncluded: false,
    monthlyRent: "", maintenanceFee: "", tenancyDuration: "12", startDate: "", paymentDueDay: "6",
    utilitiesDeposit: "300",
    petsAllowed: false, sublettingAllowed: false, renovationAllowed: false,
    airconUnits: "0",
    bankName: "", bankAccountNo: "", bankAccountName: "",
  });

  const set = (k: string, v: string | boolean) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const rent = parseFloat(form.monthlyRent) || 0;
  const duration = parseInt(form.tenancyDuration) || 12;
  const secDeposit = rent * 2;
  const stampDuty = calcStampDuty(rent, duration);
  const endDate = calcEndDate(form.startDate, duration);
  const flags = aiFlags({ ...form, airconUnits: parseInt(form.airconUnits) });

  const buildPayload = () => ({
    firmId: appUser!.firmId, createdBy: appUser!._id,
    agreementType: (templateType || "residential") as "residential" | "room" | "short_term" | "commercial",
    roomIdentifier: form.roomIdentifier || undefined,
    utilitiesHandling: templateType === "room" ? form.utilitiesHandling : undefined,
    wifiIncluded: templateType === "room" ? form.wifiIncluded as boolean : undefined,
    waterIncluded: templateType === "room" ? form.waterIncluded as boolean : undefined,
    latePaymentInterest: templateType === "room" ? parseFloat(form.latePaymentInterest) || 1.5 : undefined,
    meterReading: templateType === "room" ? form.meterReading || undefined : undefined,
    rentFreePeriod: templateType === "room" ? parseInt(form.rentFreePeriod) || 0 : undefined,
    utilitiesIncluded: templateType === "short_term" ? form.utilitiesIncluded as boolean : undefined,
    landlordName: form.landlordName, landlordIc: form.landlordIc,
    landlordPhone: form.landlordPhone, landlordEmail: form.landlordEmail || undefined,
    landlordAddress: form.landlordAddress,
    tenantName: form.tenantName, tenantIc: form.tenantIc,
    tenantPhone: form.tenantPhone, tenantEmail: form.tenantEmail || undefined,
    tenantAddress: form.tenantAddress,
    tenantIsForeigner: form.tenantIsForeigner as boolean,
    propertyAddress: form.propertyAddress,
    propertyType: form.propertyType as "apartment" | "landed" | "room" | "commercial",
    useOfPremises: form.useOfPremises as "residential" | "commercial",
    isFurnished: form.isFurnished as "furnished" | "partially" | "unfurnished",
    monthlyRent: rent, tenancyDuration: duration,
    startDate: form.startDate, endDate,
    paymentDueDay: parseInt(form.paymentDueDay),
    securityDeposit: secDeposit,
    utilitiesDeposit: parseFloat(form.utilitiesDeposit) || 300,
    petsAllowed: form.petsAllowed as boolean,
    sublettingAllowed: form.sublettingAllowed as boolean,
    renovationAllowed: form.renovationAllowed as boolean,
    airconUnits: parseInt(form.airconUnits),
    propertyLegalDesc: form.propertyLegalDesc || undefined,
    bankName: form.bankName, bankAccountNo: form.bankAccountNo,
    bankAccountName: form.bankAccountName,
    maintenanceFee: form.maintenanceFee ? parseFloat(form.maintenanceFee) : undefined,
    stampDuty, aiFlags: flags,
  });

  const handleSaveDraft = async () => {
    if (!appUser?.firmId || !appUser?._id) return;
    setSaving(true);
    try {
      const id = await createAgreement(buildPayload());
      router.push(`/dashboard/agreements/${id}`);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    if (!appUser?.firmId || !appUser?._id) return;
    setSaving(true);
    try {
      const id = await createAgreement(buildPayload());
      await updateStatus({ id: id as Id<"agreements">, status: "pending_review" });
      router.push("/dashboard");
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const btnPrimary: React.CSSProperties = {
    background: "oklch(0.55 0.14 40)", color: "oklch(0.998 0 0)",
    border: "none", borderRadius: "12px", padding: "12px 28px",
    fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer",
    transition: "background 150ms ease-out, transform 120ms ease-out",
  };
  const btnGhost: React.CSSProperties = {
    background: "transparent", color: "oklch(0.50 0.003 264)",
    border: "1.5px solid oklch(0.876 0.003 264)", borderRadius: "12px",
    padding: "12px 24px", fontSize: "0.9375rem", fontWeight: 500, cursor: "pointer",
    transition: "border-color 150ms ease-out, color 150ms ease-out",
  };

  // Show template selector if no type chosen yet
  if (!templateType) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "32px" }}>
          <button onClick={() => router.back()} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "0.875rem", color: "oklch(0.50 0.003 264)", padding: "6px 10px",
            borderRadius: "8px", transition: "background 120ms ease-out",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.938 0.002 264)")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}>
            ← Kembali
          </button>
        </div>
        <TemplateSelector onSelect={t => { setTemplateType(t); setStep(1); }} />
      </div>
    );
  }

  const selectedTemplate = TEMPLATES.find(t => t.type === templateType)!;

  return (
    <div style={{ maxWidth: "860px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button onClick={() => setTemplateType("")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "0.875rem", color: "oklch(0.50 0.003 264)", padding: "6px 10px",
            borderRadius: "8px", transition: "background 120ms ease-out",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.938 0.002 264)")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}>
            ← Kembali
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "oklch(0.09 0.006 264)", letterSpacing: "-0.02em", margin: 0 }}>
            Perjanjian Baru
          </h1>
          <span style={{
            fontSize: "0.6875rem", fontWeight: 600, color: "oklch(0.55 0.14 40)",
            background: "oklch(0.55 0.14 40 / 0.08)", border: "1px solid oklch(0.55 0.14 40 / 0.2)",
            padding: "3px 10px", borderRadius: "999px",
          }}>{selectedTemplate.icon} {selectedTemplate.labelMs}</span>
        </div>
        <span style={{
          fontSize: "0.75rem", fontWeight: 600, color: "oklch(0.50 0.003 264)",
          background: "oklch(0.938 0.002 264)", padding: "4px 12px", borderRadius: "999px",
        }}>Langkah {step} / 5</span>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: "24px" }}>
        <ProgressBar step={step} />
      </div>

      {/* Form — full width of container */}
      <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Step 1 — Parties */}
        <StepCard visible={step === 1}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>Maklumat Pihak</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.50 0.003 264)", marginTop: "4px" }}>Maklumat tuan rumah dan penyewa</p>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "16px" }}>Tuan Rumah</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
              <Field label="Nama Penuh (seperti dalam IC) *" error={errors.landlordName}>
                <Input value={form.landlordName} onChange={e => set("landlordName", e.target.value)} placeholder="cth. Ahmad bin Rosli" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="No. IC *" error={errors.landlordIc}>
                  <Input value={form.landlordIc} onChange={e => set("landlordIc", e.target.value)} placeholder="820122025032" />
                </Field>
                <Field label="No. Telefon *" error={errors.landlordPhone}>
                  <Input value={form.landlordPhone} onChange={e => set("landlordPhone", e.target.value)} placeholder="0123456789" />
                </Field>
              </div>
              <Field label="E-mel (pilihan)">
                <Input value={form.landlordEmail} onChange={e => set("landlordEmail", e.target.value)} placeholder="ahmad@email.com" />
              </Field>
              <Field label="Alamat (seperti dalam IC) *" error={errors.landlordAddress}>
                <Input value={form.landlordAddress} onChange={e => set("landlordAddress", e.target.value)} placeholder="cth. No. 12, Jalan Maju, 50000 Kuala Lumpur" />
              </Field>
            </div>
          </div>

          <div style={{ height: "1px", background: "oklch(0.938 0.002 264)", margin: "24px 0" }} />

          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "16px" }}>Penyewa</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
              <Field label="Nama Penuh (seperti dalam IC) *" error={errors.tenantName}>
                <Input value={form.tenantName} onChange={e => set("tenantName", e.target.value)} placeholder="cth. Siti binti Aminah" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="No. IC *" error={errors.tenantIc}>
                  <Input value={form.tenantIc} onChange={e => set("tenantIc", e.target.value)} placeholder="900515101234" />
                </Field>
                <Field label="No. Telefon *" error={errors.tenantPhone}>
                  <Input value={form.tenantPhone} onChange={e => set("tenantPhone", e.target.value)} placeholder="0198765432" />
                </Field>
              </div>
              <Field label="E-mel (pilihan)">
                <Input value={form.tenantEmail} onChange={e => set("tenantEmail", e.target.value)} placeholder="siti@email.com" />
              </Field>
              <Field label="Alamat (seperti dalam IC) *" error={errors.tenantAddress}>
                <Input value={form.tenantAddress} onChange={e => set("tenantAddress", e.target.value)} placeholder="cth. No. 57, Jalan Damai, 40150 Shah Alam" />
              </Field>
              <Toggle label="Penyewa adalah warga asing dengan permit kerja (aktifkan Klausa Ekspatriat)" checked={form.tenantIsForeigner as boolean} onChange={v => set("tenantIsForeigner", v)} />
            </div>
          </div>
        </StepCard>

        {/* Step 2 — Property */}
        <StepCard visible={step === 2}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>Maklumat Hartanah</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.50 0.003 264)", marginTop: "4px" }}>Alamat dan jenis hartanah</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {templateType === "room" && (
              <Field label="Pengenalan Bilik *" hint="cth. Bilik Utama, Bilik 2, Bilik Belakang" error={errors.roomIdentifier}>
                <Input value={form.roomIdentifier} onChange={e => set("roomIdentifier", e.target.value)} placeholder="cth. Bilik Utama (Master Bedroom)" />
              </Field>
            )}
            <Field label="Alamat Penuh Hartanah *" error={errors.propertyAddress}>
              <Input value={form.propertyAddress} onChange={e => set("propertyAddress", e.target.value)} placeholder="cth. No. 64, Jalan Karyawan Bestari, Puncak Bestari, 42300 Bandar Puncak Alam, Selangor" />
            </Field>
            <Field label="Perihal Hartanah Penuh (pilihan — untuk Section D/E)" hint="Untuk hartanah dengan nombor hakmilik, lot, mukim dan daerah. Biarkan kosong jika tidak berkenaan.">
              <Input value={form.propertyLegalDesc} onChange={e => set("propertyLegalDesc", e.target.value)} placeholder="cth. H.S.(D) 22376, PT 21260, Mukim Ijok, Daerah Kuala Selangor, Negeri Selangor, 261 sq. metres, Double Storey Semi-D" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Jenis Hartanah">
                <Select value={form.propertyType} onChange={e => set("propertyType", e.target.value)}>
                  <option value="apartment">Apartment / Kondominium</option>
                  <option value="landed">Rumah Teres / Banglo</option>
                  <option value="room">Bilik</option>
                  <option value="commercial">Komersial</option>
                </Select>
              </Field>
              <Field label="Kegunaan Premis (Section J)">
                <Select value={form.useOfPremises} onChange={e => set("useOfPremises", e.target.value)}>
                  <option value="residential">Kediaman (Residential)</option>
                  <option value="commercial">Komersial (Commercial)</option>
                </Select>
              </Field>
              <Field label="Kelengkapan">
                <Select value={form.isFurnished} onChange={e => set("isFurnished", e.target.value)}>
                  <option value="furnished">Perabot Lengkap</option>
                  <option value="partially">Perabot Separa</option>
                  <option value="unfurnished">Tanpa Perabot</option>
                </Select>
              </Field>
            </div>
            {templateType === "room" && (
              <Field label="Pengendalian Utiliti">
                <Select value={form.utilitiesHandling} onChange={e => set("utilitiesHandling", e.target.value)}>
                  <option value="split">Dikongsi sama rata antara semua penyewa</option>
                  <option value="landlord">Tuan rumah tanggung (termasuk dalam sewa)</option>
                  <option value="submeter">Sub-meter berasingan setiap bilik</option>
                </Select>
              </Field>
            )}
            {form.isFurnished !== "unfurnished" && (
              <div style={{
                padding: "12px 16px", borderRadius: "12px",
                background: "oklch(0.93 0.06 72 / 0.4)",
                border: "1px solid oklch(0.85 0.08 72)",
                fontSize: "0.875rem", color: "oklch(0.38 0.10 65)",
                animation: "expand 200ms cubic-bezier(0.16,1,0.3,1)",
              }}>
                ⚠️ Unit berperabot — senarai inventori perlu dilampirkan pada perjanjian.
              </div>
            )}
          </div>
        </StepCard>

        {/* Step 3 — Terms */}
        <StepCard visible={step === 3}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>Terma Sewaan</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.50 0.003 264)", marginTop: "4px" }}>Kadar sewa, tempoh, dan deposit</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Sewa Bulanan (RM) *" error={errors.monthlyRent}>
                <Input type="number" value={form.monthlyRent} onChange={e => set("monthlyRent", e.target.value)} placeholder="2500" />
              </Field>
              <Field label="Yuran Penyelenggaraan (RM/bulan)" hint="Biarkan kosong jika tiada">
                <Input type="number" value={form.maintenanceFee} onChange={e => set("maintenanceFee", e.target.value)} placeholder="cth. 120" />
              </Field>
              <Field label="Tempoh Sewaan">
                <Select value={form.tenancyDuration} onChange={e => set("tenancyDuration", e.target.value)}>
                  {templateType === "short_term" ? (
                    <>
                      <option value="1">1 Bulan</option>
                      <option value="2">2 Bulan</option>
                      <option value="3">3 Bulan</option>
                      <option value="6">6 Bulan</option>
                    </>
                  ) : (
                    <>
                      <option value="12">1 Tahun (12 bulan)</option>
                      <option value="24">2 Tahun (24 bulan)</option>
                      <option value="36">3 Tahun (36 bulan)</option>
                    </>
                  )}
                </Select>
              </Field>
              <Field label="Tarikh Mula *" error={errors.startDate}>
                <Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
              </Field>
              <Field label="Tarikh Tamat (auto)">
                <div style={{ ...inputStyle, color: "oklch(0.50 0.003 264)", background: "oklch(0.938 0.002 264)" }}>
                  {endDate || "—"}
                </div>
              </Field>
              <Field label="Tarikh Bayaran">
                <Select value={form.paymentDueDay} onChange={e => set("paymentDueDay", e.target.value)}>
                  {[1, 5, 6, 7, 10, 15].map(d => (
                    <option key={d} value={String(d)}>{d} haribulan setiap bulan</option>
                  ))}
                </Select>
              </Field>
              <Field label="Deposit Utiliti (RM)">
                <Input type="number" value={form.utilitiesDeposit} onChange={e => set("utilitiesDeposit", e.target.value)} />
              </Field>
            </div>

            {rent > 0 && (
              <div style={{
                marginTop: "8px", padding: "20px", borderRadius: "14px",
                background: "oklch(0.955 0.002 264)",
                border: "1px solid oklch(0.876 0.003 264)",
                animation: "expand 200ms cubic-bezier(0.16,1,0.3,1)",
              }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.50 0.003 264)", marginBottom: "12px" }}>Pengiraan Auto</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <SummaryRow label="Deposit Keselamatan (2 bulan)" value={`RM ${secDeposit.toLocaleString()}`} />
                  <SummaryRow label="Duti Setem (LHDN)" value={`RM ${stampDuty.toFixed(2)}`} />
                  <SummaryRow label="Yuran eDutiSetem" value="RM 10.00" />
                  <SummaryRow label="Yuran Perkhidmatan" value="RM 50.00" highlight />
                </div>
              </div>
            )}
          </div>
        </StepCard>

        {/* Step 4 — Conditions */}
        <StepCard visible={step === 4}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>Klausa Tambahan & Bank</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.50 0.003 264)", marginTop: "4px" }}>Klausa pilihan akan disertakan dalam Jadual Tambahan perjanjian</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "10px 14px", borderRadius: "10px", background: "oklch(0.938 0.002 264)", border: "1px solid oklch(0.876 0.003 264)", fontSize: "0.8125rem", color: "oklch(0.42 0.003 264)", marginBottom: "4px" }}>
              Klausa yang diaktifkan akan dimasukkan ke dalam <strong>Jadual Tambahan</strong> perjanjian secara automatik.
            </div>
            {templateType === "short_term" && (
              <Toggle label="Utiliti & internet termasuk dalam sewa bulanan" checked={form.utilitiesIncluded as boolean} onChange={v => set("utilitiesIncluded", v)} />
            )}
            {templateType === "room" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.025 50)", margin: 0 }}>Kemudahan Bilik</p>
                <Toggle label="Wifi/Internet percuma disediakan oleh tuan rumah" checked={form.wifiIncluded as boolean} onChange={v => set("wifiIncluded", v)} />
                <Toggle label="Tuan rumah tanggung bayaran air" checked={form.waterIncluded as boolean} onChange={v => set("waterIncluded", v)} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Field label="Faedah Lewat Bayar (%/bulan)" hint="Lazimnya 1.5%">
                    <Input type="number" value={form.latePaymentInterest} onChange={e => set("latePaymentInterest", e.target.value)} placeholder="1.5" />
                  </Field>
                  <Field label="Tempoh Sewa Percuma (hari)" hint="0 jika tiada">
                    <Input type="number" value={form.rentFreePeriod} onChange={e => set("rentFreePeriod", e.target.value)} placeholder="0" />
                  </Field>
                </div>
                <Field label="Bacaan Meter Elektrik (semasa masuk)" hint="Pilihan — rekod semasa penyewa masuk">
                  <Input value={form.meterReading} onChange={e => set("meterReading", e.target.value)} placeholder="cth. 1234.5" />
                </Field>
              </div>
            )}
            <Toggle label="Haiwan peliharaan dibenarkan" checked={form.petsAllowed as boolean} onChange={v => set("petsAllowed", v)} />
            <Toggle label="Penyewaan semula dibenarkan (dengan kebenaran bertulis)" checked={form.sublettingAllowed as boolean} onChange={v => set("sublettingAllowed", v)} />
            <Toggle label="Pengubahsuaian dibenarkan (dengan kebenaran bertulis)" checked={form.renovationAllowed as boolean} onChange={v => set("renovationAllowed", v)} />

            <Field label="Bilangan Unit Penghawa Dingin">
              <Select value={form.airconUnits} onChange={e => set("airconUnits", e.target.value)} style={{ width: "160px" }}>
                {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={String(n)}>{n} unit</option>)}
              </Select>
            </Field>

            <div style={{ height: "1px", background: "oklch(0.938 0.002 264)", margin: "8px 0" }} />

            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.50 0.003 264)", marginBottom: "4px" }}>Maklumat Bank (Pembayaran Sewa)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Nama Bank *" error={errors.bankName}>
                <Select value={form.bankName} onChange={e => set("bankName", e.target.value)}>
                  <option value="">Pilih bank</option>
                  {["Maybank", "CIMB", "Public Bank", "RHB", "Hong Leong", "AmBank", "Bank Islam", "BSN"].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </Select>
              </Field>
              <Field label="No. Akaun *" error={errors.bankAccountNo}>
                <Input value={form.bankAccountNo} onChange={e => set("bankAccountNo", e.target.value)} placeholder="1234567890" />
              </Field>
              <Field label="Nama Akaun *" error={errors.bankAccountName}>
                <Input value={form.bankAccountName} onChange={e => set("bankAccountName", e.target.value)} placeholder="Ahmad bin Rosli" />
              </Field>
            </div>
          </div>
        </StepCard>

        {/* Step 5 — Review */}
        <StepCard visible={step === 5}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>Semak & Jana</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.50 0.003 264)", marginTop: "4px" }}>Sahkan maklumat sebelum menghantar kepada peguam</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            {[
              { label: "Tuan Rumah", lines: [form.landlordName, form.landlordIc, form.landlordPhone] },
              { label: "Penyewa", lines: [form.tenantName, form.tenantIc, form.tenantPhone] },
            ].map(({ label, lines }) => (
              <div key={label} style={{ padding: "16px", background: "oklch(0.955 0.002 264)", borderRadius: "12px" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "8px" }}>{label}</p>
                {lines.map((l, i) => (
                  <p key={i} style={{ fontSize: "0.875rem", color: i === 0 ? "oklch(0.09 0.006 264)" : "oklch(0.50 0.003 264)", fontWeight: i === 0 ? 600 : 400, marginBottom: "2px" }}>{l}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "20px" }}>
            <SummaryRow label="Hartanah" value={form.propertyAddress.split(",")[0]} />
            <SummaryRow label="Sewa Bulanan" value={`RM ${rent.toLocaleString()}`} />
            <SummaryRow label="Tempoh" value={`${duration} bulan`} />
            <SummaryRow label="Mula → Tamat" value={`${form.startDate} → ${endDate}`} />
            <SummaryRow label="Deposit Keselamatan" value={`RM ${secDeposit.toLocaleString()}`} />
            <SummaryRow label="Duti Setem" value={`RM ${stampDuty.toFixed(2)}`} highlight />
          </div>

          {flags.length > 0 && (
            <div style={{
              padding: "16px", borderRadius: "12px",
              background: "oklch(0.93 0.06 72 / 0.3)",
              border: "1px solid oklch(0.85 0.08 72)",
              marginBottom: "8px",
            }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "oklch(0.38 0.10 65)", marginBottom: "8px" }}>⚠️ Bendera AI untuk Peguam</p>
              {flags.map((f, i) => (
                <p key={i} style={{ fontSize: "0.8125rem", color: "oklch(0.45 0.10 65)", marginBottom: "4px" }}>• {f}</p>
              ))}
            </div>
          )}
        </StepCard>
      </div>

      </div>

      {/* Nav buttons — attached to bottom of form area, same width */}
      {Object.keys(errors).length > 0 && (
        <div style={{
          marginTop: "12px", padding: "12px 16px", borderRadius: "12px",
          background: "oklch(0.93 0.06 27 / 0.10)",
          border: "1px solid oklch(0.85 0.08 27 / 0.4)",
          fontSize: "0.8125rem", color: "oklch(0.45 0.15 27)",
        }}>
          ⚠ Sila lengkapkan semua medan yang diperlukan sebelum meneruskan.
        </div>
      )}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: "12px",
        background: "oklch(0.998 0 0)",
        border: "1.5px solid oklch(0.876 0.003 264)",
        borderRadius: "16px",
        padding: "16px 24px",
      }}>
        <div style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)" }}>
          {step < 5 ? `${5 - step} langkah lagi` : "Sedia untuk dihantar"}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {step > 1 && (
            <button style={btnGhost}
              onClick={() => goToStep(step - 1)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.14 40)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.876 0.003 264)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.003 264)"; }}>
              ← Kembali
            </button>
          )}
          {step < 5 ? (
            <button style={btnPrimary}
              onClick={() => goToStep(step + 1)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.38 0.08 45)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.transform = ""; }}>
              Seterusnya →
            </button>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={btnGhost}
                disabled={saving} onClick={handleSaveDraft}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.14 40)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.876 0.003 264)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.003 264)"; }}>
                {saving ? "..." : "Simpan Draf"}
              </button>
              <button style={{ ...btnPrimary, background: "oklch(0.42 0.09 145)" }}
                disabled={saving} onClick={handleSubmit}
                onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}>
                {saving ? "Menyimpan..." : "Jana & Hantar ke Peguam →"}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
  );
}
