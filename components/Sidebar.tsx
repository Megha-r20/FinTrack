"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PieChart as ChartIcon,
  Target,
  Repeat,
  BarChart3,
  Bot,
  User,
  LogOut,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Budgets", href: "/budgets", icon: ChartIcon },
  { label: "Financial Goals", href: "/goals", icon: Target },
  { label: "Recurring", href: "/recurring", icon: Repeat },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "AI Advisor", href: "/ai-advisor", icon: Bot, badge: "AI Powered" },
  { label: "Profile & Settings", href: "/profile", icon: User },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 border-r transition-all duration-300 flex flex-col justify-between bg-[#FAF8F5] dark:bg-[#141010] border-[#E2DBD0] dark:border-[#3B3030] ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#E2DBD0] dark:border-[#3B3030]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] flex items-center justify-center text-white shadow-md cherry-glow group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-xl tracking-tight text-[#181414] dark:text-[#FAF8F5]">
                FinTrack
              </span>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#810100] dark:text-[#E53835] -mt-1">
                Luxury Edition
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow transform translate-x-0.5"
                    : "text-[#3D3333] dark:text-[#D4C9B8] hover:bg-[#FFFFFF] dark:hover:bg-[#201A1A] hover:text-[#810100] dark:hover:text-[#FAF8F5] border border-transparent hover:border-[#E2DBD0] dark:hover:border-[#3B3030]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#810100] dark:text-[#D4C9B8]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#810100]/10 dark:bg-[#810100]/25 text-[#810100] dark:text-[#FAF8F5] border border-[#810100]/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-[#E2DBD0] dark:border-[#3B3030] bg-[#FFFFFF] dark:bg-[#201A1A]/90">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#810100] text-white font-black text-xs flex items-center justify-center shrink-0 border border-[#630000] shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#201A1A]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black truncate text-[#181414] dark:text-[#FAF8F5]">
                {user?.name || "Megha R"}
              </span>
              <span className="text-[11px] font-semibold text-[#594D4D] dark:text-[#9E9090] truncate">
                {user?.email || "demo@fintrack.com"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-extrabold text-[#810100] dark:text-[#FAF8F5] hover:bg-[#810100]/10 rounded-xl transition-colors border border-[#810100]/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
