"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Plus, Menu, ShieldCheck, Search } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { CommandPaletteModal } from "@/components/CommandPaletteModal";

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAddModal: () => void;
}

export function Navbar({ onToggleSidebar, onOpenAddModal }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global Keyboard Shortcut Listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 h-20 border-b backdrop-blur-xl bg-[#FAF8F5]/90 dark:bg-[#141010]/90 border-[#E2DBD0] dark:border-[#3B3030] px-4 lg:px-8 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2.5 rounded-xl text-[#181414] dark:text-[#FAF8F5] hover:bg-[#FFFFFF] dark:hover:bg-[#201A1A] lg:hidden border border-[#E2DBD0] dark:border-[#3B3030]"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Safety Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#810100]/10 text-[#810100] dark:text-[#FAF8F5] border border-[#810100]/30 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#810100] dark:text-[#E53835]" />
            <span>Cherry Palette • Educational Safety</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search Spotlight Button */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-3 px-3.5 py-2 bg-[#FFFFFF] dark:bg-[#201A1A] hover:bg-[#FAF8F5] dark:hover:bg-[#181414] border border-[#E2DBD0] dark:border-[#3B3030] hover:border-[#810100]/50 dark:hover:border-[#E53835]/50 rounded-2xl text-xs font-bold text-[#594D4D] dark:text-[#C8BFB0] shadow-sm transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#810100] dark:text-[#E53835] group-hover:scale-110 transition-transform" />
              <span>Quick Search</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-black bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-lg text-[#810100] dark:text-[#E53835] shadow-2xs font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Currency Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-[#FFFFFF] dark:bg-[#201A1A] text-[#181414] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm">
            <span className="text-[#594D4D]">Currency:</span>
            <span className="text-[#810100] dark:text-[#E53835] font-black">{user?.currency || "₹"}</span>
          </div>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl text-[#181414] dark:text-[#FAF8F5] bg-[#FFFFFF] dark:bg-[#201A1A] hover:bg-[#810100]/10 border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm transition-all duration-200 active:scale-95"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#810100] transition-transform duration-300" />
            )}
          </button>

          {/* Quick Add Transaction Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] hover:from-[#630000] hover:to-[#810100] text-white shadow-md cherry-glow transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        </div>
      </header>

      {/* Command Palette Spotlight Search Modal */}
      <CommandPaletteModal
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenAddModal={onOpenAddModal}
      />
    </>
  );
}
