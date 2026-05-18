"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAppUser } from "@/hooks/use-app-user";
import { Building2, LayoutDashboard } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin",       label: "Semua Firma",  Icon: Building2,     exact: true  },
  { href: "/dashboard",   label: "Firma Saya",   Icon: LayoutDashboard, exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, appUser } = useAppUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (!appUser) { router.push("/setup"); return; }
    if (appUser.role !== "super_admin") router.push("/dashboard");
  }, [isLoaded, appUser, router]);

  if (!isLoaded || !appUser) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.998 0 0)" }}>
      <p style={{ color: "oklch(0.56 0.003 264)", fontSize: "0.875rem" }}>Memuatkan...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "oklch(0.963 0.002 264)" }}>

      {/* ── Platform Admin Header ── */}
      <header style={{
        background: "oklch(0.09 0.006 264)",
        boxShadow: "0 2px 16px oklch(0.05 0.003 264 / 0.4)",
        position: "sticky", top: 0, zIndex: 50, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 24px", gap: "0", height: "56px" }}>

          {/* Logo + Platform badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, marginRight: "24px" }}>
            <div style={{
              width: "32px", height: "32px", background: "oklch(0.55 0.14 40)",
              borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8125rem", fontWeight: 800, color: "oklch(0.998 0 0)",
            }}>SA</div>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "oklch(0.998 0 0)", letterSpacing: "-0.01em" }}>
                Sewasah Agree
              </span>
              <span style={{
                marginLeft: "10px", fontSize: "0.625rem", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "oklch(0.55 0.14 40)", background: "oklch(0.55 0.14 40 / 0.15)",
                border: "1px solid oklch(0.55 0.14 40 / 0.3)",
                padding: "2px 8px", borderRadius: "999px",
              }}>Platform Admin</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "flex-end", height: "56px", flex: 1, gap: "2px" }}>
            {ADMIN_NAV.map(({ href, label, Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "0 16px", height: "56px",
                    display: "flex", alignItems: "center", gap: "7px",
                    fontSize: "0.875rem", fontWeight: active ? 600 : 400,
                    color: active ? "oklch(0.998 0 0)" : "oklch(0.50 0.003 264)",
                    borderBottom: active ? "2.5px solid oklch(0.55 0.14 40)" : "2.5px solid transparent",
                    transition: "color 140ms ease-out",
                    whiteSpace: "nowrap", cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "oklch(0.75 0.003 264)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "oklch(0.50 0.003 264)"; }}>
                    <Icon size={15} />
                    {label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <span style={{ fontSize: "0.75rem", color: "oklch(0.40 0.003 264)" }}>
              {appUser.email}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px" }} className="page-enter">
        {children}
      </main>
    </div>
  );
}
