"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

type Path = "" | "A" | "B" | "C";

export default function SetupPage() {
  const { user } = useUser();
  const router = useRouter();
  const [path, setPath] = useState<Path>("");
  const [firmName, setFirmName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createFirm    = useMutation(api.firms.create);
  const upsertUser    = useMutation(api.users.upsert);
  const autoRegister  = useMutation(api.users.autoRegister);
  const firmByCode    = useQuery(api.firms.getByInviteCode,
    inviteCode.trim().length > 0 ? { code: inviteCode.trim() } : "skip"
  );

  // If no firm exists at all, Path A should be active (first ever user)
  const firstFirm = useQuery(api.firms.getFirst);
  const noFirmYet = firstFirm === null;

  if (firstFirm === undefined) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.998 0 0)" }}>
      <p style={{ color: "oklch(0.56 0.003 264)", fontSize: "0.875rem" }}>Memuatkan...</p>
    </div>
  );

  // Path A — Create firm
  const handleCreateFirm = async () => {
    if (!user || !firmName.trim()) return;
    setLoading(true); setError("");
    try {
      const firmId = await createFirm({
        name: firmName.trim(),
        slug: firmName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }) as Id<"firms">;
      await upsertUser({
        clerkId: user.id,
        name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Admin",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        firmId, role: "firm_owner",
      });
      router.push("/dashboard");
    } catch (e) {
      setError("Ralat semasa mendaftar firma. Cuba lagi.");
      console.error(e);
    } finally { setLoading(false); }
  };

  // Path B — Join firm via invite code
  const handleJoinFirm = async () => {
    if (!user || !inviteCode.trim()) return;
    if (!firmByCode) { setError("Kod jemputan tidak sah. Semak semula kod anda."); return; }
    setLoading(true); setError("");
    try {
      await autoRegister({
        clerkId: user.id,
        name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Pengguna",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        firmId: firmByCode._id,
      });
      router.push("/dashboard");
    } catch (e) {
      setError("Ralat semasa menyertai firma. Cuba lagi.");
      console.error(e);
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    padding: "11px 14px", border: "1.5px solid oklch(0.876 0.003 264)",
    borderRadius: "10px", fontSize: "0.9375rem",
    color: "oklch(0.09 0.006 264)", background: "oklch(0.998 0 0)",
    outline: "none", width: "100%", boxSizing: "border-box",
    transition: "border-color 150ms ease-out",
  };

  const PATHS = [
    {
      key: "A" as Path,
      icon: "🏛️",
      title: "Daftar Firma Guaman",
      desc: "Saya ingin mendaftarkan firma guaman saya sebagai penyedia perkhidmatan.",
      badge: noFirmYet ? null : "Jemputan Sahaja",
      disabled: !noFirmYet,
      contact: !noFirmYet,
    },
    {
      key: "B" as Path,
      icon: "🔑",
      title: "Sertai Firma Sedia Ada",
      desc: "Saya telah menerima kod jemputan daripada firma guaman saya.",
      badge: null,
      disabled: false,
      contact: false,
    },
    {
      key: "C" as Path,
      icon: "📄",
      title: "Jana Perjanjian Percuma",
      desc: "Saya ingin menjana perjanjian sewaan percuma dan memilih firma guaman.",
      badge: "Akan Datang",
      disabled: true,
      contact: false,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.998 0 0)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
        <div style={{ width: "36px", height: "36px", background: "oklch(0.55 0.14 40)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 800, color: "oklch(0.998 0 0)" }}>SA</div>
        <span style={{ fontWeight: 700, fontSize: "1.0625rem", color: "oklch(0.09 0.006 264)", letterSpacing: "-0.01em" }}>
          Sewasah <span style={{ color: "oklch(0.55 0.14 40)" }}>Agree</span>
        </span>
      </div>

      {path === "" && (
        <div style={{ maxWidth: "560px", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ fontSize: "1.625rem", fontWeight: 800, letterSpacing: "-0.025em", color: "oklch(0.09 0.006 264)", margin: "0 0 8px" }}>
              Selamat Datang ke Sewasah Agree
            </h1>
            <p style={{ fontSize: "0.9375rem", color: "oklch(0.56 0.003 264)", margin: 0, lineHeight: 1.6 }}>
              Bagaimana anda ingin menggunakan platform ini?
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {PATHS.map(({ key, icon, title, desc, badge, disabled, contact }) => (
              <div key={key}>
                <button
                  onClick={() => !disabled && setPath(key)}
                  disabled={disabled}
                  style={{
                    width: "100%", textAlign: "left",
                    background: disabled ? "oklch(0.963 0.002 264)" : "oklch(0.998 0 0)",
                    border: `1.5px solid ${disabled ? "oklch(0.876 0.003 264)" : "oklch(0.876 0.003 264)"}`,
                    borderRadius: "16px", padding: "20px 22px",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.65 : 1,
                    transition: "border-color 150ms ease-out, box-shadow 150ms ease-out",
                    display: "flex", alignItems: "flex-start", gap: "16px",
                  }}
                  onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px oklch(0.55 0.14 40 / 0.10)"; } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.876 0.003 264)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  <span style={{ fontSize: "1.75rem", lineHeight: 1, flexShrink: 0, marginTop: "2px" }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <p style={{ fontSize: "1rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: 0 }}>{title}</p>
                      {badge && (
                        <span style={{
                          fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em",
                          textTransform: "uppercase", padding: "2px 8px", borderRadius: "999px",
                          background: badge === "Jemputan Sahaja" ? "oklch(0.55 0.14 40 / 0.10)" : "oklch(0.938 0.002 264)",
                          color: badge === "Jemputan Sahaja" ? "oklch(0.42 0.12 40)" : "oklch(0.44 0.003 264)",
                        }}>{badge}</span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "oklch(0.56 0.003 264)", margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                  {!disabled && (
                    <span style={{ color: "oklch(0.55 0.14 40)", fontSize: "1.25rem", flexShrink: 0, marginTop: "2px" }}>→</span>
                  )}
                </button>
                {/* Contact link for disabled Path A */}
                {contact && (
                  <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", textAlign: "center", margin: "6px 0 0" }}>
                    Minat mendaftarkan firma?{" "}
                    <a href="mailto:eikanster@gmail.com" style={{ color: "oklch(0.55 0.14 40)", fontWeight: 500 }}>
                      Hubungi kami
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Path A — Create firm */}
      {path === "A" && (
        <div style={{ background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)", borderRadius: "20px", padding: "40px", maxWidth: "440px", width: "100%", boxShadow: "0 2px 16px oklch(0.12 0.006 264 / 0.08)" }}>
          <button onClick={() => { setPath(""); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "oklch(0.56 0.003 264)", padding: "0 0 20px", display: "flex", alignItems: "center", gap: "6px" }}>
            ← Kembali
          </button>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "oklch(0.09 0.006 264)", margin: "0 0 6px" }}>Daftar Firma Guaman</h2>
          <p style={{ fontSize: "0.875rem", color: "oklch(0.56 0.003 264)", margin: "0 0 28px", lineHeight: 1.5 }}>Anda akan menjadi pemilik firma dan boleh menguruskan pengguna serta perjanjian.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.28 0.003 264)" }}>Nama Firma *</label>
              <input value={firmName} onChange={e => setFirmName(e.target.value)} placeholder="cth. Syairus Rohan & Associates" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "oklch(0.55 0.14 40)")}
                onBlur={e => (e.target.style.borderColor = "oklch(0.876 0.003 264)")}
                onKeyDown={e => e.key === "Enter" && handleCreateFirm()} />
            </div>
            {error && <p style={{ fontSize: "0.8125rem", color: "oklch(0.48 0.18 27)", margin: 0 }}>⚠ {error}</p>}
            <button onClick={handleCreateFirm} disabled={!firmName.trim() || loading} style={{ background: !firmName.trim() || loading ? "oklch(0.876 0.003 264)" : "oklch(0.55 0.14 40)", color: "oklch(0.998 0 0)", border: "none", borderRadius: "12px", padding: "13px", fontSize: "0.9375rem", fontWeight: 600, cursor: !firmName.trim() || loading ? "not-allowed" : "pointer", width: "100%" }}>
              {loading ? "Menyediakan..." : "Daftar Firma →"}
            </button>
          </div>
        </div>
      )}

      {/* Path B — Join firm */}
      {path === "B" && (
        <div style={{ background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)", borderRadius: "20px", padding: "40px", maxWidth: "440px", width: "100%", boxShadow: "0 2px 16px oklch(0.12 0.006 264 / 0.08)" }}>
          <button onClick={() => { setPath(""); setError(""); setInviteCode(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "oklch(0.56 0.003 264)", padding: "0 0 20px", display: "flex", alignItems: "center", gap: "6px" }}>
            ← Kembali
          </button>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "oklch(0.09 0.006 264)", margin: "0 0 6px" }}>Sertai Firma</h2>
          <p style={{ fontSize: "0.875rem", color: "oklch(0.56 0.003 264)", margin: "0 0 28px", lineHeight: 1.5 }}>
            Masukkan kod jemputan yang diberikan oleh pemilik firma anda.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.28 0.003 264)" }}>Kod Jemputan</label>
              <input
                value={inviteCode}
                onChange={e => { setInviteCode(e.target.value); setError(""); }}
                placeholder="cth. SA-X7K2P9"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "oklch(0.55 0.14 40)")}
                onBlur={e => (e.target.style.borderColor = "oklch(0.876 0.003 264)")}
              />
              {/* Live lookup feedback */}
              {inviteCode.trim().length > 0 && (
                <p style={{ fontSize: "0.8125rem", margin: 0, color: firmByCode ? "oklch(0.35 0.10 148)" : "oklch(0.56 0.003 264)" }}>
                  {firmByCode === undefined ? "Mencari..." : firmByCode ? `✓ Firma dijumpai: ${firmByCode.name}` : "Firma tidak dijumpai"}
                </p>
              )}
            </div>
            {error && <p style={{ fontSize: "0.8125rem", color: "oklch(0.48 0.18 27)", margin: 0 }}>⚠ {error}</p>}
            <button onClick={handleJoinFirm} disabled={!firmByCode || loading} style={{ background: !firmByCode || loading ? "oklch(0.876 0.003 264)" : "oklch(0.55 0.14 40)", color: "oklch(0.998 0 0)", border: "none", borderRadius: "12px", padding: "13px", fontSize: "0.9375rem", fontWeight: 600, cursor: !firmByCode || loading ? "not-allowed" : "pointer", width: "100%" }}>
              {loading ? "Menyertai..." : "Sertai Firma →"}
            </button>
            <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", textAlign: "center", margin: 0 }}>
              Tiada kod? <a href="mailto:eikanster@gmail.com" style={{ color: "oklch(0.55 0.14 40)", fontWeight: 500 }}>Hubungi kami</a>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
