"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAppUser } from "@/hooks/use-app-user";
import { Home, ClipboardCheck, Plus, FolderOpen } from "lucide-react";

const TOP_NAV = [
  { href: "/dashboard",                label: "Dashboard"       },
  { href: "/dashboard/agreements/new", label: "Perjanjian Baru" },
  { href: "/dashboard/lawyer",         label: "Semakan Peguam"  },
];

type BotItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  check: (p: string) => boolean;
  center?: boolean;
};

const BOTTOM_NAV: BotItem[] = [
  {
    href: "/dashboard",
    label: "Utama",
    Icon: Home,
    check: (p) => p === "/dashboard",
  },
  {
    href: "/dashboard/lawyer",
    label: "Semak",
    Icon: ClipboardCheck,
    check: (p) => p.startsWith("/dashboard/lawyer"),
  },
  {
    href: "/dashboard/agreements/new",
    label: "Baru",
    Icon: Plus,
    check: (p) => p === "/dashboard/agreements/new",
    center: true,
  },
  {
    href: "/dashboard",
    label: "Fail",
    Icon: FolderOpen,
    check: (p) => p.startsWith("/dashboard/agreements/") && !p.includes("/new"),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { needsSetup, isLoaded, appUser } = useAppUser();

  useEffect(() => {
    if (isLoaded && needsSetup) router.push("/setup");
  }, [isLoaded, needsSetup, router]);

  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (el) el.scrollTop = 0;
  }, [pathname]);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.935 0.018 58)" }}>
        <div style={{ color: "oklch(0.55 0.025 50)", fontSize: "0.875rem" }}>Memuatkan...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "oklch(0.935 0.018 58)" }}>

      {/* ── Top Nav Bar ── */}
      <header style={{
        background: "oklch(0.145 0.038 43)",
        boxShadow: "0 2px 16px oklch(0.10 0.03 43 / 0.25)",
        position: "sticky", top: 0, zIndex: 50,
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          padding: "0 16px",
          gap: "0",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}>
          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            paddingRight: "20px",
            borderRight: "1px solid oklch(0.225 0.032 43)",
            marginRight: "8px",
            height: "56px",
            flexShrink: 0,
          }}>
            <div style={{
              width: "32px", height: "32px",
              background: "oklch(0.55 0.14 40)",
              borderRadius: "9px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8125rem", fontWeight: 800,
              color: "oklch(0.99 0.005 58)",
              boxShadow: "0 2px 6px oklch(0.55 0.14 40 / 0.35)",
              flexShrink: 0,
            }}>SA</div>
            <span style={{
              fontWeight: 700, fontSize: "0.9375rem",
              color: "oklch(0.96 0.008 58)",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}>Sewasah Agree</span>
          </div>

          {/* Tab Nav — hidden on mobile via .top-nav-tabs class */}
          <nav className="top-nav-tabs" style={{ display: "flex", alignItems: "flex-end", height: "56px", flex: 1, gap: "2px" }}>
            {TOP_NAV.map((item) => {
              const active = item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "0 18px",
                    height: "56px",
                    display: "flex", alignItems: "center",
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "oklch(0.99 0.005 58)" : "oklch(0.58 0.018 48)",
                    borderBottom: active
                      ? "2.5px solid oklch(0.55 0.14 40)"
                      : "2.5px solid transparent",
                    transition: "color 140ms ease-out, border-color 140ms ease-out",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.color = "oklch(0.78 0.012 56)";
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLElement).style.color = "oklch(0.58 0.018 48)";
                  }}>
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0, marginLeft: "auto" }}>
            <span className="flag-badge" style={{
              fontSize: "0.75rem", color: "oklch(0.50 0.018 46)",
              background: "oklch(0.22 0.030 43)",
              padding: "4px 12px", borderRadius: "999px",
            }}>🇲🇾 Malaysia</span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main
        id="main-scroll"
        style={{ flex: 1, overflowY: "auto" }}
        className="page-enter main-content"
      >
        {children}
      </main>

      {/* ── Bottom Nav (Mobile Only) ── */}
      <nav className="bottom-nav">
        {BOTTOM_NAV.map((item) => {
          const active = item.check(pathname);

          if (item.center) {
            return (
              <Link key={item.href + item.label} href={item.href} style={{ flex: 1, textDecoration: "none", display: "flex" }}>
                <div className="bottom-nav-center-slot">
                  <div className={`bottom-nav-center-btn${active ? " active" : ""}`}>
                    <item.Icon size={22} />
                  </div>
                  <span className="bottom-nav-label" style={{ color: active ? "oklch(0.55 0.14 40)" : "oklch(0.50 0.018 48)" }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.href + item.label} href={item.href} style={{ flex: 1, textDecoration: "none", display: "flex" }}>
              <div className={`bottom-nav-item${active ? " active" : ""}`}>
                <item.Icon size={20} />
                <span className="bottom-nav-label">{item.label}</span>
              </div>
            </Link>
          );
        })}

        {/* Profile slot */}
        <div className="bottom-nav-item" style={{ flex: 1, gap: "5px" }}>
          <div style={{ transform: "scale(0.9)", lineHeight: 0 }}>
            <UserButton />
          </div>
          <span className="bottom-nav-label">Profil</span>
        </div>
      </nav>
    </div>
  );
}
