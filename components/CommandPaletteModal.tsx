"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight, Wallet, PieChart, Target, Clock, Bot, User, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
}

export function CommandPaletteModal({ isOpen, onClose, onOpenAddModal }: CommandPaletteModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const currency = user?.currency || "₹";

  const [query, setQuery] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchTransactions();
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions?limit=20");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const NAV_LINKS = [
    { name: "Dashboard Overview", path: "/dashboard", icon: Wallet, desc: "Metrics, pacing & cash flow" },
    { name: "Transactions Ledger", path: "/transactions", icon: Search, desc: "Search, filter & export expenses" },
    { name: "Category Budgets", path: "/budgets", icon: PieChart, desc: "Category caps & ₹6k hostel preset" },
    { name: "Financial Goals", path: "/goals", icon: Target, desc: "Savings targets & progress" },
    { name: "Recurring Bills", path: "/recurring", icon: Clock, desc: "Subscriptions & upcoming due dates" },
    { name: "Analytics & Trends", path: "/analytics", icon: PieChart, desc: "Income vs expense graphs" },
    { name: "AI Advisor Q&A", path: "/ai-advisor", icon: Bot, desc: "Data-grounded financial advice" },
    { name: "Account Settings", path: "/profile", icon: User, desc: "Name, currency & data export" },
  ];

  const filteredNav = NAV_LINKS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) || item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTx = transactions.filter(
    (tx) =>
      tx.description.toLowerCase().includes(query.toLowerCase()) ||
      tx.category?.name.toLowerCase().includes(query.toLowerCase()) ||
      tx.amount.toString().includes(query)
  );

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-[#E2DBD0] dark:border-[#3B3030] flex items-center gap-3 bg-[#FAF8F5] dark:bg-[#141010]/80">
          <Search className="w-5 h-5 text-[#810100] dark:text-[#E53835] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page name, or search transactions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm md:text-base font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none placeholder-[#594D4D]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-[#594D4D] hover:text-[#141010] dark:hover:text-[#FAF8F5]">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-[#E2DBD0]/60 dark:bg-[#3B3030] text-[#594D4D] dark:text-[#C8BFB0] rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 p-4 overflow-y-auto space-y-5 divide-y divide-[#E2DBD0]/40 dark:divide-[#3B3030]/40">
          {/* Quick Actions */}
          {!query && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#594D4D] px-2 block">Quick Actions</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddModal();
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] hover:bg-[#810100]/10 border border-[#E2DBD0] dark:border-[#3B3030] text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#810100] to-[#630000] text-white flex items-center justify-center font-bold shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#141010] dark:text-[#FAF8F5] block">Add Transaction</span>
                    <span className="text-[10px] text-[#594D4D]">Log income or expense</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigate("/budgets")}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] hover:bg-[#810100]/10 border border-[#E2DBD0] dark:border-[#3B3030] text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#141010] dark:text-[#FAF8F5] block">Hostel ₹6k Preset</span>
                    <span className="text-[10px] text-[#594D4D]">Apply student budget template</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-2 pt-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#594D4D] px-2 block">
              Pages & Views
            </span>
            <div className="space-y-1">
              {filteredNav.map((nav, idx) => {
                const Icon = nav.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(nav.path)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF8F5] dark:hover:bg-[#141010] border border-transparent hover:border-[#E2DBD0] dark:hover:border-[#3B3030] text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] dark:bg-[#141010] text-[#810100] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#141010] dark:text-[#FAF8F5] block">{nav.name}</span>
                        <span className="text-[10px] text-[#594D4D]">{nav.desc}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#594D4D] group-hover:text-[#810100] group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matching Transactions */}
          {query && (
            <div className="space-y-2 pt-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#594D4D] px-2 block">
                Matching Transactions ({filteredTx.length})
              </span>
              {filteredTx.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#594D4D]">No matching transactions found</div>
              ) : (
                <div className="space-y-1">
                  {filteredTx.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => handleNavigate("/transactions")}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF8F5] dark:hover:bg-[#141010] border border-transparent hover:border-[#E2DBD0] dark:hover:border-[#3B3030] cursor-pointer transition-all"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#141010] dark:text-[#FAF8F5] block">{tx.description}</span>
                        <span className="text-[10px] text-[#594D4D]">
                          {tx.category?.name} • {new Date(tx.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-black ${
                          tx.type === "INCOME" ? "text-emerald-700 dark:text-emerald-400" : "text-[#810100] dark:text-[#FAF8F5]"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {currency}
                        {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Command Footer */}
        <div className="p-3 border-t border-[#E2DBD0] dark:border-[#3B3030] bg-[#FAF8F5] dark:bg-[#141010] flex items-center justify-between text-[11px] font-semibold text-[#594D4D]">
          <span>Use ⌘K to open anytime</span>
          <span className="flex items-center gap-1">
            FinTrack Spotlight <Sparkles className="w-3 h-3 text-[#810100]" />
          </span>
        </div>
      </div>
    </div>
  );
}
