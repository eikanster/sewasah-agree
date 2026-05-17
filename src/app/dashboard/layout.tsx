"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useAppUser } from "@/hooks/use-app-user";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/dashboard/agreements/new", label: "New Agreement", icon: "+" },
  { href: "/lawyer", label: "Lawyer Review", icon: "✓" },
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.94 0.018 58)" }}>
        <div style={{ color: "oklch(0.48 0.025 50)", fontSize: "0.875rem" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — deep timber */}
      <aside className="w-56 shrink-0 flex flex-col" style={{ background: "oklch(0.16 0.04 45)" }}>

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: "1px solid oklch(0.24 0.035 45)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: "oklch(0.55 0.14 40)", color: "oklch(0.99 0.005 58)" }}>
              S
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ color: "oklch(0.97 0.008 58)" }}>
                Sewasah Agree
              </p>
              {appUser && (
                <p className="text-xs leading-tight mt-0.5" style={{ color: "oklch(0.60 0.025 50)" }}>
                  {appUser.role === "lawyer" ? "Lawyer" : "Admin"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
                style={{
                  background: isActive ? "oklch(0.55 0.14 40 / 0.18)" : "transparent",
                  color: isActive ? "oklch(0.97 0.008 58)" : "oklch(0.65 0.020 50)",
                }}>
                <span className="text-xs w-4 text-center font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: "oklch(0.55 0.14 40)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid oklch(0.24 0.035 45)" }}>
          <div className="flex items-center gap-2.5">
            <UserButton />
            <p className="text-xs" style={{ color: "oklch(0.55 0.020 50)" }}>Account</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Topbar */}
        <div className="px-8 py-3 flex items-center justify-between shrink-0"
          style={{ background: "oklch(0.97 0.012 58)", borderBottom: "1px solid oklch(0.87 0.016 55)" }}>
          <div />
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "oklch(0.90 0.014 56)", color: "oklch(0.48 0.025 50)" }}>
            🇲🇾 Malaysia
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 px-8 py-8 page-enter" style={{ maxWidth: "1100px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
