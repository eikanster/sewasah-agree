"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) router.push("/dashboard");
  }, [isLoaded, userId, router]);

  if (!isLoaded) return null;
  if (userId) return null;

  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.998 0 0)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Nav ── */}
      <nav
        className="px-4 sm:px-10 flex items-center justify-between"
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "oklch(0.998 0 0 / 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.938 0.002 264)",
          height: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px", background: "oklch(0.55 0.14 40)",
            borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.75rem", fontWeight: 800, color: "oklch(0.998 0 0)",
          }}>SA</div>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "oklch(0.09 0.006 264)", letterSpacing: "-0.01em" }}>
            Sewasah <span style={{ color: "oklch(0.55 0.14 40)" }}>Agree</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/sign-in" style={{ textDecoration: "none" }}>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "0.9375rem", fontWeight: 500, color: "oklch(0.42 0.003 264)",
              padding: "8px 16px", borderRadius: "10px",
              transition: "background 150ms ease-out",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.938 0.002 264)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              Log Masuk
            </button>
          </Link>
          <Link href="/sign-up" style={{ textDecoration: "none" }}>
            <button style={{
              background: "oklch(0.55 0.14 40)", color: "oklch(0.998 0 0)",
              border: "none", borderRadius: "10px", padding: "8px 20px",
              fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer",
              transition: "background 150ms ease-out, transform 120ms ease-out",
              boxShadow: "0 2px 8px oklch(0.55 0.14 40 / 0.30)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.42 0.095 43)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.transform = ""; }}>
              Daftar Firma →
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>

        <div style={{
          display: "inline-block", fontSize: "0.6875rem", fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "oklch(0.55 0.14 40)", marginBottom: "24px",
          background: "oklch(0.55 0.14 40 / 0.08)",
          border: "1px solid oklch(0.55 0.14 40 / 0.2)",
          padding: "5px 14px", borderRadius: "999px",
        }}>
          Platform Perjanjian Sewaan Malaysia
        </div>

        <h1 style={{
          fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 800,
          letterSpacing: "-0.035em", lineHeight: 1.1,
          color: "oklch(0.09 0.006 264)", margin: "0 0 20px",
        }}>
          Perjanjian Sewaan<br />
          <span style={{ color: "oklch(0.55 0.14 40)" }}>Siap dalam Minit,</span><br />
          Bukan Hari
        </h1>

        <p style={{
          fontSize: "1.125rem", color: "oklch(0.44 0.003 264)",
          lineHeight: 1.7, margin: "0 auto 36px", maxWidth: "520px",
        }}>
          Sewasah Agree membantu firma guaman jana perjanjian sewaan yang sah, hantar untuk pengesahan peguam, dan serahkan kepada eDutiSetem — semua dalam satu platform.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
          <Link href="/sign-up" style={{ textDecoration: "none" }}>
            <button style={{
              background: "oklch(0.55 0.14 40)", color: "oklch(0.998 0 0)",
              border: "none", borderRadius: "14px", padding: "14px 32px",
              fontSize: "1rem", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 16px oklch(0.55 0.14 40 / 0.35)",
              transition: "all 150ms ease-out",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.42 0.095 43)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px oklch(0.55 0.14 40 / 0.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px oklch(0.55 0.14 40 / 0.35)"; }}>
              Daftar Firma Anda →
            </button>
          </Link>
          <Link href="/sign-in" style={{ textDecoration: "none" }}>
            <button style={{
              background: "none", color: "oklch(0.42 0.003 264)",
              border: "1.5px solid oklch(0.876 0.003 264)", borderRadius: "14px",
              padding: "14px 28px", fontSize: "1rem", fontWeight: 500, cursor: "pointer",
              transition: "all 150ms ease-out",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.55 0.14 40)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "oklch(0.876 0.003 264)"; (e.currentTarget as HTMLElement).style.color = "oklch(0.42 0.003 264)"; }}>
              Log Masuk
            </button>
          </Link>
        </div>

        {/* Trust pills */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {[
            "✓ Disokong Peguam Berlesen",
            "✓ Patuh Undang-Undang Malaysia",
            "✓ eDutiSetem Tersedia",
          ].map(tag => (
            <span key={tag} style={{
              fontSize: "0.8125rem", color: "oklch(0.44 0.003 264)",
              background: "oklch(0.963 0.002 264)",
              border: "1px solid oklch(0.876 0.003 264)",
              padding: "6px 14px", borderRadius: "999px",
            }}>{tag}</span>
          ))}
        </div>
      </section>

      {/* ── Dashboard Mockup ── */}
      <section style={{ padding: "0 24px 80px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{
          background: "oklch(0.998 0 0)",
          border: "1px solid oklch(0.876 0.003 264)",
          borderRadius: "16px", overflow: "hidden",
          boxShadow: "0 24px 64px oklch(0.09 0.006 264 / 0.10), 0 4px 16px oklch(0.09 0.006 264 / 0.06)",
        }}>
          {/* Browser chrome */}
          <div style={{ background: "oklch(0.963 0.002 264)", padding: "12px 16px", borderBottom: "1px solid oklch(0.876 0.003 264)", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {["oklch(0.65 0.18 25)", "oklch(0.72 0.16 75)", "oklch(0.65 0.14 145)"].map((c, i) => (
                <div key={i} style={{ width: "12px", height: "12px", borderRadius: "50%", background: c }} />
              ))}
            </div>
            <div style={{ flex: 1, background: "oklch(0.938 0.002 264)", borderRadius: "6px", padding: "4px 12px", fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", textAlign: "center", maxWidth: "280px", margin: "0 auto" }}>
              🔒 app.sewasahagree.my
            </div>
          </div>

          {/* Mock dashboard */}
          <div style={{ padding: "24px", background: "oklch(0.963 0.002 264)" }}>
            {/* Mock nav */}
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0"
              style={{
                background: "oklch(0.118 0.008 264)", borderRadius: "12px", padding: "12px 20px",
                marginBottom: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "28px", height: "28px", background: "oklch(0.55 0.14 40)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 800, color: "white" }}>SA</div>
                <span style={{ color: "oklch(0.998 0 0)", fontWeight: 600, fontSize: "0.875rem" }}>Sewasah Agree</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
                {["Dashboard", "Perjanjian Baru", "Semakan Peguam"].map((t, i) => (
                  <span key={t} style={{ fontSize: "0.8125rem", color: i === 0 ? "oklch(0.998 0 0)" : "oklch(0.50 0.003 264)", fontWeight: i === 0 ? 600 : 400, borderBottom: i === 0 ? "2px solid oklch(0.55 0.14 40)" : "none", paddingBottom: "2px" }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Mock stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: "20px" }}>
              {[
                { label: "Menunggu Semak", value: "3", accent: true },
                { label: "Tunggu Setem",   value: "1", accent: false },
                { label: "Selesai",        value: "12", accent: false },
                { label: "Jumlah",         value: "18", accent: false },
              ].map(({ label, value, accent }) => (
                <div key={label} style={{
                  background: accent ? "oklch(0.55 0.14 40)" : "oklch(0.998 0 0)",
                  borderRadius: "12px", padding: "16px",
                  border: accent ? "none" : "1px solid oklch(0.876 0.003 264)",
                }}>
                  <p style={{ fontSize: "1.75rem", fontWeight: 800, color: accent ? "oklch(0.998 0 0)" : "oklch(0.09 0.006 264)", margin: 0, letterSpacing: "-0.03em" }}>{value}</p>
                  <p style={{ fontSize: "0.6875rem", color: accent ? "oklch(0.88 0.05 40)" : "oklch(0.56 0.003 264)", margin: "4px 0 0", fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Mock table */}
            <div style={{ background: "oklch(0.998 0 0)", borderRadius: "12px", border: "1px solid oklch(0.876 0.003 264)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid oklch(0.938 0.002 264)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "oklch(0.09 0.006 264)" }}>Senarai Perjanjian</span>
                <span style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)" }}>Mei 2026</span>
              </div>
              {[
                { landlord: "Ahmad bin Rosli",    tenant: "Siti binti Aminah",    rent: "RM 1,800", status: "Diluluskan",     statusColor: "oklch(0.900 0.068 148)", statusFg: "oklch(0.30 0.100 148)" },
                { landlord: "Rohani binti Yusof", tenant: "Muhamad Zulhizzat",   rent: "RM 2,500", status: "Menunggu Semak", statusColor: "oklch(0.930 0.065 72)",  statusFg: "oklch(0.38 0.120 65)"  },
                { landlord: "Syazwan Hanani",     tenant: "Ajmal Arif",           rent: "RM 1,600", status: "Selesai",        statusColor: "oklch(0.380 0.090 148)", statusFg: "oklch(0.970 0.008 58)" },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: i < 2 ? "1px solid oklch(0.938 0.002 264)" : "none",
                  background: i % 2 === 0 ? "oklch(0.998 0 0)" : "oklch(0.980 0.001 264)",
                }}>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "oklch(0.09 0.006 264)", margin: 0 }}>{row.landlord}</p>
                    <p style={{ fontSize: "0.75rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>{row.tenant}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "oklch(0.20 0.004 264)" }}>{row.rent}</span>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 600, background: row.statusColor, color: row.statusFg, padding: "3px 10px", borderRadius: "999px" }}>{row.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: "80px 24px", background: "oklch(0.963 0.002 264)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "16px" }}>
            Cara Ia Berfungsi
          </p>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "oklch(0.09 0.006 264)", margin: "0 0 12px" }}>
            Tiga Langkah ke Perjanjian Sah
          </h2>
          <p style={{ fontSize: "1rem", color: "oklch(0.50 0.003 264)", marginBottom: "56px", lineHeight: 1.6 }}>
            Daripada maklumat klien hingga dokumen distamp — dalam masa 10 minit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: "📋", title: "Isi Borang",       desc: "Admin isi borang AI — maklumat tuan rumah, penyewa, hartanah dan terma. Sistem kira duti setem secara automatik." },
              { step: "02", icon: "⚖️", title: "Semakan Peguam",   desc: "Peguam semak dan luluskan perjanjian dalam dashboard. AI tandakan klausa luar biasa untuk perhatian peguam." },
              { step: "03", icon: "✅", title: "Setem & Hantar",   desc: "Sistem bantu proses eDutiSetem dan hantar salinan kepada semua pihak secara automatik." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{
                background: "oklch(0.998 0 0)", borderRadius: "18px",
                padding: "32px 24px", textAlign: "left",
                border: "1px solid oklch(0.876 0.003 264)",
                boxShadow: "0 1px 3px oklch(0.12 0.006 264 / 0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "1.75rem" }}>{icon}</span>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.1em", color: "oklch(0.55 0.14 40)", background: "oklch(0.55 0.14 40 / 0.08)", padding: "3px 8px", borderRadius: "999px" }}>LANGKAH {step}</span>
                </div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: "0 0 10px" }}>{title}</h3>
                <p style={{ fontSize: "0.9375rem", color: "oklch(0.50 0.003 264)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "80px 24px", background: "oklch(0.998 0 0)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.55 0.14 40)", marginBottom: "16px" }}>Ciri-Ciri</p>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "oklch(0.09 0.006 264)", margin: "0 0 12px" }}>
              Semua Yang Firma Anda Perlukan
            </h2>
            <p style={{ fontSize: "1rem", color: "oklch(0.50 0.003 264)", lineHeight: 1.6 }}>
              Dibina khas untuk firma guaman Malaysia yang ingin memodenkan aliran kerja mereka.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: "🤖", title: "Jana Automatik",        desc: "AI kumpul maklumat klien dan jana draf perjanjian serta-merta. Tiada lagi salin tampal dari Word." },
              { icon: "⚖️", title: "Pengesahan Peguam",     desc: "Setiap perjanjian disemak dan diluluskan oleh peguam berlesen sebelum diserahkan kepada klien." },
              { icon: "🔖", title: "eDutiSetem Mudah",      desc: "Panduan langkah demi langkah untuk proses setem melalui portal eDutiSetem LHDN. Tiada pengiraan manual." },
              { icon: "📧", title: "Penghantaran Automatik", desc: "Selepas setem, sistem hantar salinan kepada tuan rumah dan penyewa secara automatik melalui e-mel." },
              { icon: "📊", title: "Dashboard Firma",        desc: "Lihat semua perjanjian firma dalam satu papan pemuka — status, nilai, dan tindakan yang perlu diambil." },
              { icon: "🔒", title: "Data Selamat",           desc: "Semua data disimpan secara selamat. Setiap firma hanya boleh akses data mereka sendiri." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                padding: "24px", borderRadius: "16px",
                border: "1px solid oklch(0.876 0.003 264)",
                transition: "box-shadow 180ms ease-out, transform 180ms ease-out",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px oklch(0.12 0.006 264 / 0.10)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = ""; }}>
                <span style={{ fontSize: "1.75rem", display: "block", marginBottom: "12px" }}>{icon}</span>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: "0 0 8px" }}>{title}</h3>
                <p style={{ fontSize: "0.875rem", color: "oklch(0.50 0.003 264)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: "80px 24px", background: "oklch(0.118 0.008 264)" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "oklch(0.998 0 0)", margin: "0 0 16px", lineHeight: 1.15 }}>
            Sedia Untuk Mula?
          </h2>
          <p style={{ fontSize: "1.0625rem", color: "oklch(0.60 0.003 264)", lineHeight: 1.6, marginBottom: "36px" }}>
            Daftarkan firma guaman anda dan mula proses perjanjian sewaan pertama anda hari ini.
          </p>
          <Link href="/sign-up" style={{ textDecoration: "none" }}>
            <button style={{
              background: "oklch(0.55 0.14 40)", color: "oklch(0.998 0 0)",
              border: "none", borderRadius: "14px", padding: "15px 36px",
              fontSize: "1.0625rem", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 20px oklch(0.55 0.14 40 / 0.40)",
              transition: "all 150ms ease-out",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.62 0.14 40)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "oklch(0.55 0.14 40)"; (e.currentTarget as HTMLElement).style.transform = ""; }}>
              Daftar Firma Sekarang →
            </button>
          </Link>
          <p style={{ fontSize: "0.8125rem", color: "oklch(0.44 0.003 264)", marginTop: "14px" }}>
            Tiada kontrak jangka panjang. Hubungi kami untuk maklumat harga.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "oklch(0.09 0.006 264)", padding: "40px 40px 32px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "28px", height: "28px", background: "oklch(0.55 0.14 40)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 800, color: "white" }}>SA</div>
                <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "oklch(0.998 0 0)" }}>
                  Sewasah <span style={{ color: "oklch(0.55 0.14 40)" }}>Agree</span>
                </span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "oklch(0.44 0.003 264)", margin: 0, maxWidth: "240px", lineHeight: 1.6 }}>
                Platform perjanjian sewaan untuk firma guaman Malaysia.
              </p>
            </div>

            <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "oklch(0.56 0.003 264)", marginBottom: "12px" }}>Platform</p>
                {["Log Masuk", "Daftar Firma"].map(l => (
                  <p key={l} style={{ fontSize: "0.875rem", color: "oklch(0.44 0.003 264)", margin: "0 0 8px", cursor: "pointer" }}>{l}</p>
                ))}
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "oklch(0.56 0.003 264)", marginBottom: "12px" }}>Hubungi</p>
                <p style={{ fontSize: "0.875rem", color: "oklch(0.44 0.003 264)", margin: "0 0 8px" }}>eikanster@gmail.com</p>
                <p style={{ fontSize: "0.875rem", color: "oklch(0.44 0.003 264)", margin: 0 }}>Malaysia</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid oklch(0.18 0.006 264)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "0.8125rem", color: "oklch(0.38 0.003 264)", margin: 0 }}>
              © 2026 Sewasah Agree Sdn Bhd. Hak cipta terpelihara.
            </p>
            <p style={{ fontSize: "0.8125rem", color: "oklch(0.38 0.003 264)", margin: 0 }}>
              Dibuat dengan ❤️ di Malaysia
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
