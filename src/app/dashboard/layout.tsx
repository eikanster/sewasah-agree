"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAppUser } from "@/hooks/use-app-user";

const navItems = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/agreements/new", label: "Perjanjian Baru", exact: true },
  { href: "/lawyer", label: "Semakan Peguam", exact: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { needsSetup, isLoaded, appUser } = useAppUser();

  useEffect(() => {
    if (isLoaded && needsSetup) router.push("/setup");
  }, [isLoaded, needsSetup, router]);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.94 0.018 58)" }}>
        <div style={{ color: "oklch(0.55 0.025 50)", fontSize: "0.875rem" }}>Memuatkan...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>

      {/* Sidebar */}
      <aside style={{
        width: "224px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "oklch(0.14 0.035 42)",
      }}>

        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid oklch(0.22 0.03 42)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px",
              background: "oklch(0.55 0.14 40)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              fontWeight: 800,
              color: "oklch(0.99 0.005 58)",
              letterSpacing: "-0.02em",
              flexShrink: 0,
            }}>SA</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "oklch(0.96 0.008 58)", lineHeight: 1.2 }}>
                Sewasah Agree
              </p>
              <p style={{ fontSize: "0.6875rem", color: "oklch(0.50 0.020 48)", marginTop: "1px" }}>
                {appUser?.role === "lawyer" ? "Peguam" : "Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <p style={{
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "oklch(0.42 0.018 46)",
            padding: "8px 12px 6px",
          }}>Menu</p>

          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  background: isActive ? "oklch(0.55 0.14 40 / 0.20)" : "transparent",
                  color: isActive ? "oklch(0.96 0.008 58)" : "oklch(0.60 0.020 48)",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 400,
                  transition: "background 120ms ease-out, color 120ms ease-out",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "oklch(0.22 0.03 42)";
                    (e.currentTarget as HTMLElement).style.color = "oklch(0.82 0.012 56)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "oklch(0.60 0.020 48)";
                  }
                }}>
                  <span>{item.label}</span>
                  {isActive && (
                    <span style={{
                      width: "6px", height: "6px",
                      borderRadius: "50%",
                      background: "oklch(0.55 0.14 40)",
                      flexShrink: 0,
                    }} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid oklch(0.22 0.03 42)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <UserButton />
            <p style={{ fontSize: "0.75rem", color: "oklch(0.48 0.018 46)" }}>Akaun saya</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "auto", background: "oklch(0.94 0.018 58)" }}>
        {/* Topbar */}
        <div style={{
          padding: "12px 40px",
          borderBottom: "1px solid oklch(0.88 0.014 55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          background: "oklch(0.96 0.014 58)",
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: "0.75rem",
            color: "oklch(0.55 0.025 50)",
            background: "oklch(0.90 0.014 56)",
            padding: "4px 12px",
            borderRadius: "999px",
          }}>🇲🇾 Malaysia</span>
        </div>

        {/* Page */}
        <main style={{ flex: 1, padding: "40px", maxWidth: "1080px" }} className="page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
