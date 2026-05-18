"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAppUser } from "@/hooks/use-app-user";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.28 0.003 264)" }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>{hint}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid oklch(0.876 0.003 264)",
  borderRadius: "10px", fontSize: "0.9375rem",
  color: "oklch(0.09 0.006 264)", background: "oklch(0.998 0 0)",
  outline: "none", transition: "border-color 150ms ease-out, box-shadow 150ms ease-out",
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

export default function SettingsPage() {
  const { appUser } = useAppUser();
  const firm = useQuery(api.firms.getById, appUser?.firmId ? { id: appUser.firmId } : "skip");
  const updateFirm = useMutation(api.firms.update);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "", address: "", phone: "", email: "",
    lawyerName: "", barNo: "",
  });

  useEffect(() => {
    if (firm) {
      setForm({
        name:       firm.name       ?? "",
        address:    firm.address    ?? "",
        phone:      firm.phone      ?? "",
        email:      firm.email      ?? "",
        lawyerName: firm.lawyerName ?? "",
        barNo:      firm.barNo      ?? "",
      });
    }
  }, [firm]);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!appUser?.firmId) return;
    setSaving(true);
    await updateFirm({
      id: appUser.firmId,
      name:       form.name       || undefined,
      address:    form.address    || undefined,
      phone:      form.phone      || undefined,
      email:      form.email      || undefined,
      lawyerName: form.lawyerName || undefined,
      barNo:      form.barNo      || undefined,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!firm) return (
    <div style={{ color: "oklch(0.56 0.003 264)", fontSize: "0.875rem" }}>Memuatkan...</div>
  );

  return (
    <div style={{ maxWidth: "640px" }} className="page-enter">

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "6px" }}>
          Tetapan
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em",
          color: "oklch(0.09 0.006 264)", margin: 0 }}>
          Maklumat Firma
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "oklch(0.50 0.003 264)", marginTop: "6px" }}>
          Maklumat ini akan dipaparkan dalam pengepala dokumen perjanjian.
        </p>
      </div>

      {/* Firm Details */}
      <div style={{
        background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "18px", overflow: "hidden",
        boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05)", marginBottom: "16px",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid oklch(0.895 0.002 264)",
          background: "oklch(0.963 0.002 264)" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>
            Maklumat Firma
          </p>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field label="Nama Firma *" hint="Contoh: Syairus Rohan & Associates">
            <Input value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="cth. Syairus Rohan & Associates" />
          </Field>
          <Field label="Alamat Firma" hint="Alamat pejabat yang akan dipaparkan dalam dokumen">
            <Input value={form.address} onChange={e => set("address", e.target.value)}
              placeholder="cth. Suite 12-3, Menara ABC, Jalan Ampang, 50450 Kuala Lumpur" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="No. Telefon">
              <Input value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="cth. 03-2123 4567" />
            </Field>
            <Field label="E-mel Firma">
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="cth. info@firma.com.my" />
            </Field>
          </div>
        </div>
      </div>

      {/* Lawyer Details */}
      <div style={{
        background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "18px", overflow: "hidden",
        boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.05)", marginBottom: "24px",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid oklch(0.895 0.002 264)",
          background: "oklch(0.963 0.002 264)" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>
            Maklumat Peguam
          </p>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field label="Nama Peguam" hint="Nama penuh seperti dalam kad undi peguam">
            <Input value={form.lawyerName} onChange={e => set("lawyerName", e.target.value)}
              placeholder="cth. Syairus Rohan bin Mohd Noor" />
          </Field>
          <Field label="No. Bar / Nombor Keahlian" hint="Nombor pendaftaran Majlis Peguam Malaysia">
            <Input value={form.barNo} onChange={e => set("barNo", e.target.value)}
              placeholder="cth. B-12345" />
          </Field>
        </div>
      </div>

      {/* PDF Preview Note */}
      <div style={{
        padding: "16px 20px", borderRadius: "12px",
        background: "oklch(0.55 0.14 40 / 0.06)",
        border: "1px solid oklch(0.55 0.14 40 / 0.20)",
        marginBottom: "24px",
      }}>
        <p style={{ fontSize: "0.8125rem", color: "oklch(0.38 0.08 40)", margin: 0, lineHeight: 1.6 }}>
          <strong>Nota:</strong> Nama firma, alamat, nama peguam dan nombor bar akan dipaparkan dalam pengepala setiap dokumen perjanjian yang dijana. Pastikan maklumat ini tepat sebelum menghantar dokumen kepada klien.
        </p>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-brand"
          style={{ padding: "12px 32px" }}
        >
          {saving ? "Menyimpan..." : "Simpan Tetapan"}
        </button>
        {saved && (
          <span style={{
            fontSize: "0.875rem", fontWeight: 500,
            color: "oklch(0.35 0.10 148)",
            animation: "pageIn 200ms ease-out both",
          }}>
            ✓ Tersimpan
          </span>
        )}
      </div>

    </div>
  );
}
