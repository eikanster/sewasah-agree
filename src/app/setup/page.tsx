"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

export default function SetupPage() {
  const { user } = useUser();
  const router = useRouter();
  const existingFirm = useQuery(api.firms.getFirst);
  const createFirm = useMutation(api.firms.create);
  const upsertUser = useMutation(api.users.upsert);
  const autoRegister = useMutation(api.users.autoRegister);

  const [firmName, setFirmName] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoJoining, setAutoJoining] = useState(false);

  // Auto-join existing firm as "user" (no firm creation needed)
  useEffect(() => {
    if (existingFirm && user && !autoJoining) {
      setAutoJoining(true);
      autoRegister({
        clerkId: user.id,
        name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Pengguna",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        firmId: existingFirm._id,
      }).then(() => router.push("/dashboard"));
    }
  }, [existingFirm, user]);

  // First user — create firm
  const handleCreateFirm = async () => {
    if (!user || !firmName) return;
    setLoading(true);
    try {
      const firmId = await createFirm({
        name: firmName,
        slug: firmName.toLowerCase().replace(/\s+/g, "-"),
      }) as Id<"firms">;

      await upsertUser({
        clerkId: user.id,
        name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Admin",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        firmId,
        role: "firm_owner",
      });

      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking if firm exists
  if (existingFirm === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.998 0 0)" }}>
        <p style={{ color: "oklch(0.56 0.003 264)", fontSize: "0.875rem" }}>Memuatkan...</p>
      </div>
    );
  }

  // Firm exists — auto-joining
  if (existingFirm) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.998 0 0)" }}>
        <div style={{
          background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
          borderRadius: "20px", padding: "48px", maxWidth: "420px", width: "100%",
          textAlign: "center", boxShadow: "0 2px 16px oklch(0.12 0.006 264 / 0.08)",
        }}>
          <div style={{
            width: "52px", height: "52px", background: "oklch(0.55 0.14 40)",
            borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.25rem", fontWeight: 800, color: "oklch(0.998 0 0)",
            margin: "0 auto 20px",
          }}>SA</div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: "0 0 8px" }}>
            Mendaftar masuk...
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "oklch(0.56 0.003 264)", lineHeight: 1.6, margin: 0 }}>
            Anda sedang didaftarkan ke <strong>{existingFirm.name}</strong>. Akses anda akan diaktifkan oleh pemilik firma.
          </p>
        </div>
      </div>
    );
  }

  // No firm yet — first user creates firm
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.998 0 0)" }}>
      <div style={{
        background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
        borderRadius: "20px", padding: "48px", maxWidth: "440px", width: "100%",
        boxShadow: "0 2px 16px oklch(0.12 0.006 264 / 0.08)",
      }}>
        <div style={{
          width: "52px", height: "52px", background: "oklch(0.55 0.14 40)",
          borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.25rem", fontWeight: 800, color: "oklch(0.998 0 0)",
          marginBottom: "24px",
        }}>SA</div>

        <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "oklch(0.09 0.006 264)", margin: "0 0 6px" }}>
          Daftar firma anda
        </h1>
        <p style={{ fontSize: "0.875rem", color: "oklch(0.56 0.003 264)", margin: "0 0 28px", lineHeight: 1.5 }}>
          Sediakan firma guaman anda dalam masa seminit.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.28 0.003 264)" }}>
              Nama Firma *
            </label>
            <input
              value={firmName}
              onChange={e => setFirmName(e.target.value)}
              placeholder="cth. Syairus Rohan & Associates"
              style={{
                padding: "11px 14px", border: "1.5px solid oklch(0.876 0.003 264)",
                borderRadius: "10px", fontSize: "0.9375rem",
                color: "oklch(0.09 0.006 264)", background: "oklch(0.998 0 0)",
                outline: "none", width: "100%", boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "oklch(0.55 0.14 40)")}
              onBlur={e => (e.target.style.borderColor = "oklch(0.876 0.003 264)")}
              onKeyDown={e => e.key === "Enter" && handleCreateFirm()}
            />
          </div>

          <button
            onClick={handleCreateFirm}
            disabled={!firmName || loading}
            style={{
              background: !firmName || loading ? "oklch(0.876 0.003 264)" : "oklch(0.55 0.14 40)",
              color: "oklch(0.998 0 0)", border: "none", borderRadius: "12px",
              padding: "13px", fontSize: "0.9375rem", fontWeight: 600,
              cursor: !firmName || loading ? "not-allowed" : "pointer",
              transition: "background 150ms ease-out",
              width: "100%",
            }}
          >
            {loading ? "Menyediakan..." : "Sediakan Firma →"}
          </button>
        </div>
      </div>
    </div>
  );
}
