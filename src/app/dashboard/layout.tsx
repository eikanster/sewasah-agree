"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppUser } from "@/hooks/use-app-user";

const navItems = [
  { href: "/dashboard", label: "Dashboard", emoji: "🏠" },
  { href: "/dashboard/agreements/new", label: "New Agreement", emoji: "✍️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { needsSetup, isLoaded } = useAppUser();

  useEffect(() => {
    if (isLoaded && needsSetup) {
      router.push("/setup");
    }
  }, [isLoaded, needsSetup, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col"
        style={{ background: "oklch(0.20 0.04 220)" }}>

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-warm flex items-center justify-center text-white font-bold text-sm">
              SA
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Sewasah Agree</p>
              <p className="text-white/40 text-xs">Agreement Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}>
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <UserButton />
            <div>
              <p className="text-white/80 text-xs font-medium">My Account</p>
              <p className="text-white/40 text-xs">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            🇲🇾 Malaysia · Klang Valley
          </div>
        </div>
        <div className="px-8 py-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
