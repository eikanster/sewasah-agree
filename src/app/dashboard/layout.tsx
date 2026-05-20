"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAppUser } from "@/hooks/use-app-user";
import { PERMISSIONS, AppRole } from "@/lib/permissions";
import { Home, ClipboardCheck, Plus, FolderOpen, Settings, LayoutGrid, Menu, X, ShieldAlert, Info } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

type TopNavItem = { href: string; label: string; show: (r: AppRole) => boolean };
type BotItem = {
  href: string; label: string;
  Icon: React.ComponentType<{ size?: number }>;
  check: (p: string) => boolean;
  show: (r: AppRole) => boolean;
  center?: boolean;
};

const TOP_NAV: TopNavItem[] = [
  { href: "/dashboard",                label: "Dashboard",       show: PERMISSIONS.canViewDashboard    },
  { href: "/dashboard/agreements/new", label: "Perjanjian Baru", show: PERMISSIONS.canCreateAgreement  },
  { href: "/dashboard/lawyer",         label: "Semakan Peguam",  show: PERMISSIONS.canReviewAgreements },
  { href: "/dashboard/settings",       label: "Tetapan",         show: PERMISSIONS.canViewSettings     },
];

const BOTTOM_NAV: BotItem[] = [
  { href: "/dashboard",                label: "Utama",   Icon: Home,          check: (p) => p === "/dashboard" || (p.startsWith("/dashboard/agreements/") && !p.includes("/new")), show: PERMISSIONS.canViewDashboard },
  { href: "/dashboard/agreements/new", label: "Baru",    Icon: Plus,           check: (p) => p === "/dashboard/agreements/new", center: true,            show: PERMISSIONS.canCreateAgreement  },
  { href: "/dashboard/lawyer",         label: "Semak",   Icon: ClipboardCheck, check: (p) => p.startsWith("/dashboard/lawyer"),                          show: PERMISSIONS.canReviewAgreements },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { needsSetup, isLoaded, appUser } = useAppUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (needsSetup) { router.push("/setup"); return; }
    if (pathname === "/dashboard") {
      // super_admin: redirect to /admin only on first visit (not when coming from /admin)
      if (appUser?.role === "super_admin") {
        const fromAdmin = sessionStorage.getItem("visited_dashboard");
        if (!fromAdmin) router.push("/admin");
      }
      // lawyer: always go to review queue
      if (appUser?.role === "lawyer") router.push("/dashboard/lawyer");
    }
    sessionStorage.setItem("visited_dashboard", "1");
  }, [isLoaded, needsSetup, appUser?.role, pathname, router]);

  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (el) el.scrollTop = 0;
  }, [pathname]);

  // All hooks must be called before any conditional returns
  const role = (appUser?.role ?? "user") as AppRole;
  const firm = useQuery(api.firms.getById, appUser?.firmId ? { id: appUser.firmId } : "skip");
  const counts = useQuery(api.agreements.getDashboardCounts, appUser?.firmId ? { firmId: appUser.firmId } : "skip");
  const pendingReview = counts?.pendingReview ?? 0;

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.998 0 0)" }}>
        <div style={{ color: "oklch(0.50 0.003 264)", fontSize: "0.875rem" }}>Memuatkan...</div>
      </div>
    );
  }

  // "user" role — show waiting screen
  if (role === "user") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.998 0 0)" }}>
        <div style={{
          background: "oklch(0.998 0 0)", border: "1px solid oklch(0.876 0.003 264)",
          borderRadius: "20px", padding: "52px 48px", maxWidth: "440px", width: "100%",
          textAlign: "center", boxShadow: "0 2px 16px oklch(0.12 0.006 264 / 0.08)",
        }}>
          <div style={{
            width: "52px", height: "52px", background: "oklch(0.930 0.065 72)",
            borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", margin: "0 auto 20px",
          }}>⏳</div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "oklch(0.09 0.006 264)", margin: "0 0 10px" }}>
            Menunggu Peruntukan Akses
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "oklch(0.56 0.003 264)", lineHeight: 1.6, margin: "0 0 24px" }}>
            Akaun anda telah berjaya didaftar. Pemilik firma sedang menyemak dan akan memberikan akses kepada anda tidak lama lagi.
          </p>
          <p style={{ fontSize: "0.8125rem", color: "oklch(0.56 0.003 264)", margin: 0 }}>
            Daftar masuk sebagai: <strong style={{ color: "oklch(0.09 0.006 264)" }}>{appUser?.email}</strong>
          </p>
          <div style={{ marginTop: "24px" }}>
            <UserButton />
          </div>
        </div>
      </div>
    );
  }

  const visibleTopNav = TOP_NAV.filter(item => item.show(role));
  const visibleBottomNav = BOTTOM_NAV.filter(item => item.show(role));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "oklch(0.998 0 0)" }}>

      {/* ── Top Nav Bar ── */}
      <header style={{
        background: "oklch(0.118 0.008 264)",
        boxShadow: "0 2px 16px oklch(0.10 0.004 264 / 0.25)",
        position: "sticky", top: 0, zIndex: 50,
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          padding: "0 16px", gap: "0",
          overflowX: "auto", scrollbarWidth: "none",
        }}>
          {/* Logo */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            paddingRight: "20px",
            borderRight: "1px solid oklch(0.22 0.006 264)",
            marginRight: "8px", height: "56px", flexShrink: 0,
          }}>
            <div style={{
              width: "32px", height: "32px",
              background: "oklch(0.55 0.14 40)", borderRadius: "9px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8125rem", fontWeight: 800, color: "oklch(0.998 0 0)",
              boxShadow: "0 2px 6px oklch(0.55 0.14 40 / 0.35)", flexShrink: 0,
            }}>SA</div>
            <span style={{
              fontWeight: 700, fontSize: "0.9375rem",
              color: "oklch(0.970 0.002 264)",
              letterSpacing: "-0.01em", whiteSpace: "nowrap",
            }}>Sewasah Agree</span>
          </div>

          {/* Tab Nav */}
          <nav className="top-nav-tabs" style={{ display: "flex", alignItems: "flex-end", height: "56px", flex: 1, gap: "2px" }}>
            {visibleTopNav.map((item) => {
              const active = item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "0 18px", height: "56px",
                    display: "flex", alignItems: "center",
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 400,
                    color: active ? "oklch(0.998 0 0)" : "oklch(0.54 0.003 264)",
                    borderBottom: active ? "2.5px solid oklch(0.55 0.14 40)" : "2.5px solid transparent",
                    transition: "color 140ms ease-out, border-color 140ms ease-out",
                    whiteSpace: "nowrap", cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "oklch(0.78 0.012 56)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "oklch(0.54 0.003 264)"; }}>
                    {item.label}
                    {item.href === "/dashboard/lawyer" && pendingReview > 0 && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        minWidth: "18px", height: "18px", padding: "0 5px",
                        background: "oklch(0.55 0.14 40)", color: "oklch(0.998 0 0)",
                        borderRadius: "999px", fontSize: "0.625rem", fontWeight: 700,
                        marginLeft: "6px", lineHeight: 1,
                      }}>{pendingReview}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, marginLeft: "auto" }}>
            {/* Firm context pill */}
            {firm && (
              <span style={{
                fontSize: "0.75rem", fontWeight: 500,
                color: "oklch(0.60 0.003 264)",
                background: "oklch(0.20 0.006 264)",
                padding: "4px 12px", borderRadius: "999px",
                whiteSpace: "nowrap", maxWidth: "180px",
                overflow: "hidden", textOverflow: "ellipsis",
              }}>{firm.name}</span>
            )}
            {/* Platform admin shortcut for super_admin */}
            {role === "super_admin" && (
              <Link href="/admin" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  fontSize: "0.75rem", fontWeight: 600,
                  color: "oklch(0.55 0.14 40)",
                  background: "oklch(0.55 0.14 40 / 0.12)",
                  border: "1px solid oklch(0.55 0.14 40 / 0.25)",
                  padding: "4px 10px", borderRadius: "999px",
                  cursor: "pointer", whiteSpace: "nowrap",
                  transition: "background 150ms ease-out",
                }}>
                  <LayoutGrid size={11} />
                  Platform
                </div>
              </Link>
            )}
            <span className="flag-badge" style={{
              fontSize: "0.75rem", color: "oklch(0.48 0.003 264)",
              background: "oklch(0.18 0.006 264)",
              padding: "4px 12px", borderRadius: "999px",
            }}>🇲🇾 Malaysia</span>
            <div className="hidden md:block">
              <UserButton />
            </div>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden flex items-center justify-center p-2 rounded-lg text-[oklch(0.970_0.002_264)] hover:bg-white/5 transition-all cursor-pointer animate-fade-in"
              style={{ border: "none", background: "transparent" }}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
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
        {visibleBottomNav.map((item) => {
          const active = item.check(pathname);

          if (item.center) {
            return (
              <Link key={item.href + item.label} href={item.href} style={{ flex: 1, textDecoration: "none", display: "flex" }}>
                <div className="bottom-nav-center-slot">
                  <div className={`bottom-nav-center-btn${active ? " active" : ""}`}>
                    <item.Icon size={22} />
                  </div>
                  <span className="bottom-nav-label" style={{ color: active ? "oklch(0.55 0.14 40)" : "oklch(0.48 0.003 264)" }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <Link key={item.href + item.label} href={item.href} style={{ flex: 1, textDecoration: "none", display: "flex" }}>
              <div className={`bottom-nav-item${active ? " active" : ""}`} style={{ position: "relative" }}>
                <div style={{ position: "relative", lineHeight: 0 }}>
                  <item.Icon size={20} />
                  {item.href === "/dashboard/lawyer" && pendingReview > 0 && (
                    <span style={{
                      position: "absolute", top: "-4px", right: "-6px",
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: "oklch(0.55 0.14 40)",
                      border: "1.5px solid oklch(0.118 0.008 264)",
                    }} />
                  )}
                </div>
                <span className="bottom-nav-label">{item.label}</span>
              </div>
            </Link>
          );
        })}

      </nav>

      {/* ── Mobile Hamburger Drawer Overlay ── */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] md:hidden"
          style={{
            animation: "fadeIn 200ms ease-out forwards",
          }}
        >
          {/* Drawer Panel */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-0 right-0 h-full w-[310px] max-w-[85vw] bg-[oklch(0.118_0.008_264)] border-l border-[oklch(0.22_0.006_264)] p-5 flex flex-col justify-between"
            style={{
              animation: "slideIn 240ms cubic-bezier(0.16, 1, 0.3, 1) both",
              boxShadow: "-10px 0 30px oklch(0.10 0.004 264 / 0.5)",
            }}
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[oklch(0.55_0.14_40)] rounded-lg flex items-center justify-center text-[10px] font-extrabold text-[oklch(0.998_0_0)] shadow-[0_2px_6px_oklch(0.55_0.14_40_/_0.35)]">
                    SA
                  </div>
                  <span className="font-bold text-sm text-[oklch(0.970_0.002_264)]">Sewasah Menu</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-[oklch(0.60_0.003_264)] hover:text-[oklch(0.970_0.002_264)] transition-colors cursor-pointer"
                  style={{ border: "none", background: "transparent" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Profile Card */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mb-6">
                <UserButton />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[oklch(0.60_0.003_264)] font-medium">Log Masuk Sebagai</span>
                  <span className="text-xs font-semibold text-[oklch(0.970_0.002_264)] truncate max-w-[180px]">{appUser?.email}</span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-[oklch(0.44_0.003_264)] uppercase tracking-wider block mb-2 px-1">
                  Menu Utama
                </span>
                
                {/* Home/Utama */}
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: "none" }}>
                  <div className="flex items-center gap-3 p-2.5 text-[oklch(0.970_0.002_264)] hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                    <Home size={18} className="text-[oklch(0.55_0.14_40)]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Halaman Utama</span>
                    </div>
                  </div>
                </Link>

                {/* Perjanjian Baru */}
                <Link href="/dashboard/agreements/new" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: "none" }}>
                  <div className="flex items-center gap-3 p-2.5 text-[oklch(0.970_0.002_264)] hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                    <Plus size={18} className="text-[oklch(0.55_0.14_40)]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Draf Perjanjian Baru</span>
                    </div>
                  </div>
                </Link>

                {/* Semakan Peguam */}
                {PERMISSIONS.canReviewAgreements(role) && (
                  <Link href="/dashboard/lawyer" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: "none" }}>
                    <div className="flex items-center gap-3 p-2.5 text-[oklch(0.970_0.002_264)] hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                      <ClipboardCheck size={18} className="text-[oklch(0.55_0.14_40)]" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Semakan Peguam</span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Settings */}
                {PERMISSIONS.canViewSettings(role) && (
                  <Link href="/dashboard/settings" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: "none" }}>
                    <div className="flex items-center gap-3 p-2.5 text-[oklch(0.970_0.002_264)] hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                      <Settings size={18} className="text-[oklch(0.55_0.14_40)]" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Tetapan</span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Platform Admin */}
                {role === "super_admin" && (
                  <Link href="/admin" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: "none" }}>
                    <div className="flex items-center gap-3 p-2.5 text-[oklch(0.970_0.002_264)] hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                      <LayoutGrid size={18} className="text-[oklch(0.55_0.14_40)]" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Platform Admin</span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom About & Disclaimer */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              {/* About */}
              <div className="p-2.5 bg-white/5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[oklch(0.55_0.14_40)] uppercase tracking-wider">
                  <Info size={12} />
                  <span>Mengenai Sewasah</span>
                </div>
                <p className="text-[10px] text-[oklch(0.60_0.003_264)] leading-relaxed">
                  Sistem pengurusan draf dan semakan perjanjian sewa pintar, direka khas untuk firma guaman di Malaysia.
                </p>
              </div>

              {/* Disclaimer */}
              <div className="p-2.5 bg-[oklch(0.55_0.14_40_/_0.04)] border border-[oklch(0.55_0.14_40_/_0.15)] rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[oklch(0.55_0.14_40)] uppercase tracking-wider">
                  <ShieldAlert size={12} />
                  <span>Penafian Ringkas</span>
                </div>
                <p className="text-[9px] text-[oklch(0.60_0.003_264)] leading-relaxed">
                  Sistem ini menyediakan alat bantu penyediaan draf. Draf yang dijana bukan pengganti nasihat guaman formal sehingga disemak/disahkan oleh peguam.
                </p>
              </div>

              {/* Footer */}
              <div className="text-center text-[9px] text-[oklch(0.44_0.003_264)] pt-1">
                Sewasah Agree v1.0.0
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
