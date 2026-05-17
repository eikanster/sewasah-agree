"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
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

// ─── Styled Input ─────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.35 0.04 45)" }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: "0.75rem", color: "oklch(0.60 0.020 50)" }}>{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid oklch(0.87 0.016 55)",
  borderRadius: "10px",
  fontSize: "0.9375rem",
  color: "oklch(0.13 0.025 45)",
  background: "oklch(0.99 0.005 58)",
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
        borderColor: focused ? "oklch(0.55 0.14 40)" : "oklch(0.87 0.016 55)",
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
        borderColor: focused ? "oklch(0.55 0.14 40)" : "oklch(0.87 0.016 55)",
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
      background: "oklch(0.99 0.005 58)",
      border: "1.5px solid oklch(0.87 0.016 55)",
      borderRadius: "20px",
      padding: "32px",
      animation: "pageIn 260ms cubic-bezier(0.16,1,0.3,1) both",
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
                background: done ? "oklch(0.42 0.09 145)" : active ? "oklch(0.55 0.14 40)" : "oklch(0.90 0.014 56)",
                color: done || active ? "oklch(0.99 0.005 58)" : "oklch(0.55 0.025 50)",
                boxShadow: active ? "0 0 0 4px oklch(0.55 0.14 40 / 0.18)" : "none",
                transition: "all 250ms cubic-bezier(0.16,1,0.3,1)",
                flexShrink: 0,
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: "0.6875rem", fontWeight: active ? 600 : 400,
                color: active ? "oklch(0.55 0.14 40)" : done ? "oklch(0.42 0.09 145)" : "oklch(0.60 0.020 50)",
                whiteSpace: "nowrap",
                transition: "color 250ms ease-out",
              }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "2px", margin: "0 6px", marginBottom: "20px",
                background: done ? "oklch(0.42 0.09 145)" : "oklch(0.90 0.014 56)",
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
    <label style={{
      display: "flex", alignItems: "center", gap: "12px",
      cursor: "pointer", userSelect: "none",
      padding: "12px 16px",
      borderRadius: "12px",
      border: `1.5px solid ${checked ? "oklch(0.55 0.14 40)" : "oklch(0.87 0.016 55)"}`,
      background: checked ? "oklch(0.55 0.14 40 / 0.06)" : "oklch(0.99 0.005 58)",
      transition: "all 150ms ease-out",
    }}>
      <div style={{
        width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
        border: `2px solid ${checked ? "oklch(0.55 0.14 40)" : "oklch(0.75 0.020 50)"}`,
        background: checked ? "oklch(0.55 0.14 40)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 150ms ease-out",
        fontSize: "0.6875rem", color: "oklch(0.99 0.005 58)", fontWeight: 700,
      }}>
        {checked ? "✓" : ""}
      </div>
      <span style={{ fontSize: "0.875rem", color: "oklch(0.28 0.04 45)", fontWeight: checked ? 500 : 400 }}>
        {label}
      </span>
    </label>
  );
}

// ─── Summary Row ──────────────────────────────────────────────────────────

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid oklch(0.92 0.012 56)" }}>
      <span style={{ fontSize: "0.875rem", color: "oklch(0.55 0.025 50)" }}>{label}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: highlight ? 700 : 600, color: highlight ? "oklch(0.55 0.14 40)" : "oklch(0.13 0.025 45)" }}>{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function NewAgreementPage() {
  const router = useRouter();
  const { appUser } = useAppUser();
  const createAgreement = useMutation(api.agreements.create);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const goToStep = (n: number) => {
    setStep(n);
    const el = document.getElementById("main-scroll");
    if (el) el.scrollTop = 0;
  };

  const [form, setForm] = useState({
    landlordName: "", landlordIc: "", landlordPhone: "", landlordEmail: "",
    tenantName: "", tenantIc: "", tenantPhone: "", tenantEmail: "",
    tenantIsForeigner: false,
    propertyAddress: "", propertyType: "apartment", isFurnished: "unfurnished",
    monthlyRent: "", tenancyDuration: "12", startDate: "", paymentDueDay: "6",
    utilitiesDeposit: "300",
    petsAllowed: false, sublettingAllowed: false, renovationAllowed: false,
    airconUnits: "0",
    bankName: "", bankAccountNo: "", bankAccountName: "",
  });

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const rent = parseFloat(form.monthlyRent) || 0;
  const duration = parseInt(form.tenancyDuration) || 12;
  const secDeposit = rent * 2;
  const stampDuty = calcStampDuty(rent, duration);
  const endDate = calcEndDate(form.startDate, duration);
  const flags = aiFlags({ ...form, airconUnits: parseInt(form.airconUnits) });

  const handleSubmit = async () => {
    if (!appUser?.firmId || !appUser?._id) return;
    setSaving(true);
    try {
      await createAgreement({
        firmId: appUser.firmId, createdBy: appUser._id,
        landlordName: form.landlordName, landlordIc: form.landlordIc,
        landlordPhone: form.landlordPhone, landlordEmail: form.landlordEmail || undefined,
        tenantName: form.tenantName, tenantIc: form.tenantIc,
        tenantPhone: form.tenantPhone, tenantEmail: form.tenantEmail || undefined,
        tenantIsForeigner: form.tenantIsForeigner as boolean,
        propertyAddress: form.propertyAddress,
        propertyType: form.propertyType as "apartment" | "landed" | "room" | "commercial",
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
        bankName: form.bankName, bankAccountNo: form.bankAccountNo,
        bankAccountName: form.bankAccountName,
        stampDuty, aiFlags: flags,
      });
      router.push("/dashboard");
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const btnPrimary: React.CSSProperties = {
    background: "oklch(0.55 0.14 40)", color: "oklch(0.99 0.005 58)",
    border: "none", borderRadius: "12px", padding: "12px 28px",
    fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer",
    transition: "background 150ms ease-out, transform 120ms ease-out",
  };
  const btnGhost: React.CSSProperties = {
    background: "transparent", color: "oklch(0.55 0.025 50)",
    border: "1.5px solid oklch(0.87 0.016 55)", borderRadius: "12px",
    padding: "12px 24px", fontSize: "0.9375rem", fontWeight: 500, cursor: "pointer",
    transition: "border-color 150ms ease-out, color 150ms ease-out",
  };

  return (
    <div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <button onClick={() => router.back()} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "0.875rem", color: "oklch(0.55 0.025 50)", padding: "6px",
          borderRadius: "8px", transition: "background 120ms ease-out",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.90 0.014 56)")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
          ← Kembali
        </button>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "oklch(0.13 0.025 45)", letterSpacing: "-0.02em", margin: 0 }}>
            Perjanjian Baru
          </h1>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: "32px" }}>
        <ProgressBar step={step} />
      </div>

      {/* Steps — two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Step 1 — Parties */}
        <StepCard visible={step === 1}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.13 0.025 45)", margin: 0 }}>Maklumat Pihak</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.55 0.025 50)", marginTop: "4px" }}>Maklumat tuan rumah dan penyewa</p>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "16px" }}>Tuan Rumah</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
              <Field label="Nama Penuh (seperti dalam IC) *">
                <Input value={form.landlordName} onChange={e => set("landlordName", e.target.value)} placeholder="cth. Ahmad bin Rosli" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="No. IC *">
                  <Input value={form.landlordIc} onChange={e => set("landlordIc", e.target.value)} placeholder="820122-02-5032" />
                </Field>
                <Field label="No. Telefon *">
                  <Input value={form.landlordPhone} onChange={e => set("landlordPhone", e.target.value)} placeholder="0123456789" />
                </Field>
              </div>
              <Field label="E-mel (pilihan)">
                <Input value={form.landlordEmail} onChange={e => set("landlordEmail", e.target.value)} placeholder="ahmad@email.com" />
              </Field>
            </div>
          </div>

          <div style={{ height: "1px", background: "oklch(0.90 0.014 56)", margin: "24px 0" }} />

          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "16px" }}>Penyewa</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
              <Field label="Nama Penuh (seperti dalam IC) *">
                <Input value={form.tenantName} onChange={e => set("tenantName", e.target.value)} placeholder="cth. Siti binti Aminah" />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="No. IC *">
                  <Input value={form.tenantIc} onChange={e => set("tenantIc", e.target.value)} placeholder="900515-10-1234" />
                </Field>
                <Field label="No. Telefon *">
                  <Input value={form.tenantPhone} onChange={e => set("tenantPhone", e.target.value)} placeholder="0198765432" />
                </Field>
              </div>
              <Field label="E-mel (pilihan)">
                <Input value={form.tenantEmail} onChange={e => set("tenantEmail", e.target.value)} placeholder="siti@email.com" />
              </Field>
              <Toggle label="Penyewa adalah warga asing dengan permit kerja (aktifkan Klausa Ekspatriat)" checked={form.tenantIsForeigner as boolean} onChange={v => set("tenantIsForeigner", v)} />
            </div>
          </div>
        </StepCard>

        {/* Step 2 — Property */}
        <StepCard visible={step === 2}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.13 0.025 45)", margin: 0 }}>Maklumat Hartanah</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.55 0.025 50)", marginTop: "4px" }}>Alamat dan jenis hartanah</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Field label="Alamat Penuh Hartanah *">
              <Input value={form.propertyAddress} onChange={e => set("propertyAddress", e.target.value)} placeholder="cth. Unit 2-12, Tingkat 2, Pangsapuri Suria Subang, 40150 Shah Alam" />
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
              <Field label="Kelengkapan">
                <Select value={form.isFurnished} onChange={e => set("isFurnished", e.target.value)}>
                  <option value="furnished">Perabot Lengkap</option>
                  <option value="partially">Perabot Separa</option>
                  <option value="unfurnished">Tanpa Perabot</option>
                </Select>
              </Field>
            </div>
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
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.13 0.025 45)", margin: 0 }}>Terma Sewaan</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.55 0.025 50)", marginTop: "4px" }}>Kadar sewa, tempoh, dan deposit</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Sewa Bulanan (RM) *">
                <Input type="number" value={form.monthlyRent} onChange={e => set("monthlyRent", e.target.value)} placeholder="2500" />
              </Field>
              <Field label="Tempoh Sewaan">
                <Select value={form.tenancyDuration} onChange={e => set("tenancyDuration", e.target.value)}>
                  <option value="12">1 Tahun (12 bulan)</option>
                  <option value="24">2 Tahun (24 bulan)</option>
                  <option value="36">3 Tahun (36 bulan)</option>
                </Select>
              </Field>
              <Field label="Tarikh Mula *">
                <Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
              </Field>
              <Field label="Tarikh Tamat (auto)">
                <div style={{ ...inputStyle, color: "oklch(0.55 0.025 50)", background: "oklch(0.93 0.012 58)" }}>
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
                background: "oklch(0.96 0.018 58)",
                border: "1px solid oklch(0.87 0.016 55)",
                animation: "expand 200ms cubic-bezier(0.16,1,0.3,1)",
              }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.025 50)", marginBottom: "12px" }}>Pengiraan Auto</p>
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
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.13 0.025 45)", margin: 0 }}>Syarat Khas & Bank</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.55 0.025 50)", marginTop: "4px" }}>Syarat tambahan dan maklumat pembayaran</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.025 50)", marginBottom: "4px" }}>Syarat Khas</p>
            <Toggle label="Haiwan peliharaan dibenarkan" checked={form.petsAllowed as boolean} onChange={v => set("petsAllowed", v)} />
            <Toggle label="Penyewaan semula dibenarkan (dengan kebenaran bertulis)" checked={form.sublettingAllowed as boolean} onChange={v => set("sublettingAllowed", v)} />
            <Toggle label="Pengubahsuaian dibenarkan (dengan kebenaran bertulis)" checked={form.renovationAllowed as boolean} onChange={v => set("renovationAllowed", v)} />

            <Field label="Bilangan Unit Penghawa Dingin">
              <Select value={form.airconUnits} onChange={e => set("airconUnits", e.target.value)} style={{ width: "160px" }}>
                {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={String(n)}>{n} unit</option>)}
              </Select>
            </Field>

            <div style={{ height: "1px", background: "oklch(0.90 0.014 56)", margin: "8px 0" }} />

            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.025 50)", marginBottom: "4px" }}>Maklumat Bank (Pembayaran Sewa)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Nama Bank *">
                <Select value={form.bankName} onChange={e => set("bankName", e.target.value)}>
                  <option value="">Pilih bank</option>
                  {["Maybank", "CIMB", "Public Bank", "RHB", "Hong Leong", "AmBank", "Bank Islam", "BSN"].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </Select>
              </Field>
              <Field label="No. Akaun *">
                <Input value={form.bankAccountNo} onChange={e => set("bankAccountNo", e.target.value)} placeholder="1234567890" />
              </Field>
              <Field label="Nama Akaun *" >
                <Input value={form.bankAccountName} onChange={e => set("bankAccountName", e.target.value)} placeholder="Ahmad bin Rosli" />
              </Field>
            </div>
          </div>
        </StepCard>

        {/* Step 5 — Review */}
        <StepCard visible={step === 5}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.13 0.025 45)", margin: 0 }}>Semak & Jana</h2>
            <p style={{ fontSize: "0.875rem", color: "oklch(0.55 0.025 50)", marginTop: "4px" }}>Sahkan maklumat sebelum menghantar kepada peguam</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            {[
              { label: "Tuan Rumah", lines: [form.landlordName, form.landlordIc, form.landlordPhone] },
              { label: "Penyewa", lines: [form.tenantName, form.tenantIc, form.tenantPhone] },
            ].map(({ label, lines }) => (
              <div key={label} style={{ padding: "16px", background: "oklch(0.96 0.014 58)", borderRadius: "12px" }}>
                <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "8px" }}>{label}</p>
                {lines.map((l, i) => (
                  <p key={i} style={{ fontSize: "0.875rem", color: i === 0 ? "oklch(0.13 0.025 45)" : "oklch(0.55 0.025 50)", fontWeight: i === 0 ? 600 : 400, marginBottom: "2px" }}>{l}</p>
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

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid oklch(0.87 0.016 55)" }}>
        <button style={btnGhost}
          onClick={() => step > 1 ? goToStep(step - 1) : router.back()}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.14 40)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.87 0.016 55)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.025 50)"; }}>
          {step === 1 ? "Batal" : "← Kembali"}
        </button>
        {step < 5 ? (
          <button style={btnPrimary}
            onClick={() => goToStep(step + 1)}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.38 0.08 45)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.transform = ""; }}>
            Seterusnya →
          </button>
        ) : (
          <button style={{ ...btnPrimary, background: "oklch(0.42 0.09 145)" }}
            disabled={saving} onClick={handleSubmit}
            onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ""}>
            {saving ? "Menyimpan..." : "Jana & Hantar ke Peguam →"}
          </button>
        )}
      </div>
      </div>

      {/* Live summary panel — right column */}
      <div style={{ position: "sticky", top: "0", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{
          background: "oklch(0.975 0.010 58)",
          border: "1.5px solid oklch(0.875 0.016 55)",
          borderRadius: "18px", padding: "24px",
          boxShadow: "0 1px 3px oklch(0.14 0.038 43 / 0.06)",
        }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "16px" }}>
            Ringkasan
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Step indicators */}
            {[
              { n: 1, label: "Pihak",    done: step > 1, summary: form.landlordName ? `${form.landlordName} → ${form.tenantName || "..."}` : null },
              { n: 2, label: "Hartanah", done: step > 2, summary: form.propertyAddress ? form.propertyAddress.split(",")[0] : null },
              { n: 3, label: "Terma",    done: step > 3, summary: rent > 0 ? `RM ${rent.toLocaleString()}/bulan` : null },
              { n: 4, label: "Syarat",   done: step > 4, summary: step > 4 ? "Selesai" : null },
              { n: 5, label: "Semak",    done: false,    summary: null },
            ].map(({ n, label, done, summary }) => (
              <div key={n} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6875rem", fontWeight: 700,
                  background: done ? "oklch(0.42 0.09 145)" : step === n ? "oklch(0.55 0.14 40)" : "oklch(0.90 0.014 56)",
                  color: done || step === n ? "oklch(0.99 0.005 58)" : "oklch(0.60 0.020 50)",
                  marginTop: "1px",
                }}>
                  {done ? "✓" : n}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.8125rem", fontWeight: step === n ? 600 : 400, color: step === n ? "oklch(0.22 0.035 45)" : done ? "oklch(0.42 0.09 145)" : "oklch(0.60 0.020 50)", margin: 0 }}>
                    {label}
                  </p>
                  {summary && (
                    <p style={{ fontSize: "0.75rem", color: "oklch(0.55 0.025 50)", marginTop: "2px", lineHeight: 1.3 }}>
                      {summary}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stamp duty preview */}
        {rent > 0 && (
          <div style={{
            background: "oklch(0.975 0.010 58)",
            border: "1.5px solid oklch(0.875 0.016 55)",
            borderRadius: "18px", padding: "20px",
            animation: "pageIn 200ms cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "14px" }}>
              Pengiraan
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Sewa Bulanan", value: `RM ${rent.toLocaleString()}` },
                { label: "Deposit (2 bulan)", value: `RM ${secDeposit.toLocaleString()}` },
                { label: "Duti Setem", value: `RM ${stampDuty.toFixed(2)}` },
                { label: "Yuran eDutiSetem", value: "RM 10.00" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8125rem", color: "oklch(0.55 0.025 50)" }}>{label}</span>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.22 0.035 45)" }}>{value}</span>
                </div>
              ))}
              <div style={{ height: "1px", background: "oklch(0.87 0.016 55)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "oklch(0.22 0.035 45)" }}>Jumlah Perkhidmatan</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "oklch(0.55 0.14 40)" }}>RM 50.00</span>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
  );
}
