"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAppUser } from "@/hooks/use-app-user";

const NAV = [
  { href: "/dashboard",                    label: "Dashboard",       sub: "Ringkasan"     },
  { href: "/dashboard/agreements/new",     label: "Perjanjian Baru", sub: "Cipta dokumen" },
  { href: "/dashboard/lawyer",              label: "Semakan Peguam",  sub: "Lulus / tolak" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { needsSetup, isLoaded, appUser } = useAppUser();

  useEffect(() => {
    if (isLoaded && needsSetup) router.push("/setup");
  }, [isLoaded, needsSetup, router]);

  // Scroll content panel to top on route change
  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (el) el.scrollTop = 0;
  }, [pathname]);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.935 0.018 58)" }}>
        <div style={{ color: "oklch(0.55 0.025 50)", fontSize: "0.875rem", letterSpacing: "0.01em" }}>
          Memuatkan...
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", background: "oklch(0.935 0.018 58)", overflow: "hidden" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: "220px", flexShrink: 0,
        display: "flex", flexDirection: "column",
        background: "oklch(0.145 0.038 43)",
        boxShadow: "2px 0 24px oklch(0.10 0.03 43 / 0.20)",
        position: "relative", zIndex: 10,
        height: "100vh", overflowY: "auto",
      }}>

        {/* Inner texture line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: "oklch(0.30 0.035 43)",
        }} />

        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid oklch(0.225 0.032 43)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{
              width: "36px", height: "36px", flexShrink: 0,
              background: "oklch(0.55 0.14 40)",
              borderRadius: "11px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.875rem", fontWeight: 800,
              color: "oklch(0.99 0.005 58)",
              letterSpacing: "-0.02em",
              boxShadow: "0 2px 8px oklch(0.55 0.14 40 / 0.40)",
            }}>SA</div>
            <div>
              <p style={{
                fontWeight: 700, fontSize: "0.875rem",
                color: "oklch(0.965 0.008 58)", lineHeight: 1.2, margin: 0,
              }}>Sewasah Agree</p>
              <p style={{
                fontSize: "0.6875rem",
                color: "oklch(0.48 0.018 46)",
                marginTop: "2px",
              }}>{appUser?.role === "lawyer" ? "Portal Peguam" : "Portal Admin"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <p style={{
            fontSize: "0.625rem", fontWeight: 600,
            letterSpacing: "0.10em", textTransform: "uppercase",
            color: "oklch(0.40 0.018 46)",
            padding: "4px 10px 8px",
          }}>Menu</p>

          {NAV.map((item) => {
            const active = item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "10px 12px",
                  borderRadius: "12px",
                  background: active ? "oklch(0.55 0.14 40 / 0.18)" : "transparent",
                  border: active ? "1px solid oklch(0.55 0.14 40 / 0.22)" : "1px solid transparent",
                  transition: "background 140ms ease-out, border-color 140ms ease-out",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "oklch(0.22 0.030 43)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}>
                  <div>
                    <p style={{
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 400,
                      color: active ? "oklch(0.965 0.008 58)" : "oklch(0.62 0.018 48)",
                      margin: 0, lineHeight: 1.2,
                      transition: "color 140ms ease-out",
                    }}>{item.label}</p>
                    <p style={{
                      fontSize: "0.6875rem",
                      color: active ? "oklch(0.75 0.06 40)" : "oklch(0.42 0.015 46)",
                      margin: 0, marginTop: "2px",
                    }}>{item.sub}</p>
                  </div>
                  {active && (
                    <div style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "oklch(0.55 0.14 40)",
                      boxShadow: "0 0 6px oklch(0.55 0.14 40 / 0.6)",
                      flexShrink: 0,
                    }} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid oklch(0.225 0.032 43)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UserButton />
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "oklch(0.72 0.015 48)", margin: 0 }}>
                {appUser?.name?.split(" ")[0] ?? "Pengguna"}
              </p>
              <p style={{ fontSize: "0.6875rem", color: "oklch(0.42 0.015 46)", margin: 0 }}>
                {appUser?.email ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{
          padding: "12px 40px",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          background: "oklch(0.950 0.016 58)",
          borderBottom: "1px solid oklch(0.888 0.014 56)",
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: "0.75rem", fontWeight: 500,
            color: "oklch(0.58 0.022 50)",
            background: "oklch(0.915 0.014 56)",
            padding: "5px 14px", borderRadius: "999px",
            letterSpacing: "0.02em",
          }}>🇲🇾 Malaysia</div>
        </div>

        <main id="main-scroll" style={{ flex: 1, padding: "40px", maxWidth: "1100px", overflowY: "auto", scrollBehavior: "smooth" }} className="page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
