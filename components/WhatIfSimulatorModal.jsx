"use client";
import React, { useState } from "react";
import { HelpCircle, AlertTriangle, CheckCircle, Calculator, Sparkles, ArrowRight } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export function WhatIfSimulatorModal({ isOpen, onClose, currency = "₹" }) {
  const { showToast } = useToast();
  const [itemTitle, setItemTitle] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!plannedAmount || parseFloat(plannedAmount) <= 0) return;

    setSimulating(true);
    try {
      const res = await fetch("/api/ai/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemTitle: itemTitle || "Planned Purchase",
          plannedAmount: parseFloat(plannedAmount),
        }),
      });

      if (res.ok) {
        setResult(await res.json());
      } else {
        showToast("Simulation failed", "error");
      }
    } catch {
      showToast("Error running simulation", "error");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] text-white flex items-center justify-center shadow-md cherry-glow">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">"Can I Afford This?" Simulator</h3>
              <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0]">Test purchase impact before spending money</p>
            </div>
          </div>

          <button onClick={onClose} className="text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] rounded-xl p-2">
            Close
          </button>
        </div>

        <form onSubmit={handleSimulate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Planned Purchase / Trip Name</label>
            <input
              type="text"
              placeholder="e.g. Weekend Trip to Lonavala / New Sneakers"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-sm font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Planned Cost Amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#594D4D] font-bold text-lg">{currency}</span>
              <input
                type="number"
                step="50"
                required
                placeholder="2500"
                value={plannedAmount}
                onChange={(e) => setPlannedAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-lg font-black text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={simulating}
            className="w-full py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{simulating ? "Calculating Impact..." : "Simulate Budget Impact"}</span>
          </button>
        </form>

        {/* Simulation Output Card */}
        {result && (
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#141010] dark:text-[#FAF8F5]">{result.itemTitle} ({currency}{result.plannedAmount})</span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  result.riskLevel === "SAFE"
                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                    : result.riskLevel === "SEVERE_IMPACT"
                    ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                    : "bg-rose-500/15 text-rose-600 border-rose-500/30"
                }`}
              >
                {result.riskLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030]">
                <span className="text-[10px] font-bold text-[#594D4D] uppercase">Current Daily Spend</span>
                <div className="text-sm font-black text-[#141010] dark:text-[#FAF8F5]">{currency}{result.currentSafeDailyLimit}/day</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030]">
                <span className="text-[10px] font-bold text-[#594D4D] uppercase">New Daily Spend</span>
                <div className={`text-sm font-black ${result.newSafeDailyLimit < result.currentSafeDailyLimit * 0.5 ? "text-rose-500" : "text-emerald-600"}`}>
                  {currency}{result.newSafeDailyLimit}/day
                </div>
              </div>
            </div>

            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] font-medium leading-relaxed bg-[#810100]/10 p-3 rounded-xl border border-[#810100]/30">
              💡 {result.advice}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
