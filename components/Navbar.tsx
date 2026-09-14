"use client";

import React from "react";
import { Sun, Moon, Plus, Menu, ShieldCheck } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAddModal: () => void;
}

export function Navbar({ onToggleSidebar, onOpenAddModal }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-20 border-b backdrop-blur-xl bg-[#FAF8F5]/90 dark:bg-[#141010]/90 border-[#E2DBD0] dark:border-[#3B3030] px-4 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#181414] dark:text-[#FAF8F5] hover:bg-[#FFFFFF] dark:hover:bg-[#201A1A] lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Safety Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#810100]/10 text-[#810100] dark:text-[#FAF8F5] border border-[#810100]/30">
          <ShieldCheck className="w-4 h-4 text-[#810100] dark:text-[#E53835]" />
          <span>Cherry Palette • Educational Safety</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Currency Indicator */}
        <div className="hidden md:flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#FFFFFF] dark:bg-[#201A1A] text-[#181414] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm">
          <span>Currency:</span>
          <span className="text-[#810100] dark:text-[#E53835] font-black">{user?.currency || "₹"}</span>
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-[#181414] dark:text-[#FAF8F5] bg-[#FFFFFF] dark:bg-[#201A1A] hover:bg-[#810100]/10 border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm transition-all"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#810100]" />}
        </button>

        {/* Quick Add Transaction Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] hover:from-[#630000] hover:to-[#810100] text-white shadow-md cherry-glow transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>
    </header>
  );
}
