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
      className={`fixed top-0 left-0 z-40 h-screen w-64 border-r transition-all duration-300 flex flex-col justify-between bg-[#EDEBDD] dark:bg-[#1B1717] border-[#DCD7C5] dark:border-[#382D2D] ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#DCD7C5] dark:border-[#382D2D]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] flex items-center justify-center text-[#EDEBDD] shadow-lg cherry-glow">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#1B1717] dark:text-[#EDEBDD]">
                FinTrack
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#810100] dark:text-[#E53835] -mt-1">
                Cherry Noir Edition
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
                    ? "bg-gradient-to-r from-[#810100] to-[#630000] text-[#EDEBDD] shadow-md cherry-glow"
                    : "text-[#544A4A] dark:text-[#C8BFB0] hover:bg-[#FAF8F2] dark:hover:bg-[#2A2323] hover:text-[#1B1717] dark:hover:text-[#EDEBDD]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#EDEBDD]" : "text-[#810100] dark:text-[#C8BFB0]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#810100]/15 text-[#810100] dark:text-[#EDEBDD] border border-[#810100]/30">
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
      <div className="p-4 border-t border-[#DCD7C5] dark:border-[#382D2D] bg-[#F6F4EB] dark:bg-[#252020]/60">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#810100] text-[#EDEBDD] font-bold text-xs flex items-center justify-center shrink-0 border border-[#630000] shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate text-[#1B1717] dark:text-[#EDEBDD]">
                {user?.name || "Megha R"}
              </span>
              <span className="text-[11px] text-[#887B7B] dark:text-[#8C8080] truncate">
                {user?.email || "demo@fintrack.com"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#810100] dark:text-[#EDEBDD] hover:bg-[#810100]/10 dark:hover:bg-[#810100]/30 rounded-xl transition-colors border border-[#810100]/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
