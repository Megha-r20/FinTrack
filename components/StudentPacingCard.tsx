"use client";

import React from "react";
import { Wallet, Calendar, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StudentPacingCardProps {
  summary: {
    totalBudgeted: number;
    totalSpentInBudgets: number;
    totalRemaining: number;
    overallPercentage: number;
    daysRemaining: number;
    weeksRemaining: number;
    safeDailyAllowance: number;
    safeWeeklyAllowance: number;
  };
  onApplyPreset?: () => void;
  isApplyingPreset?: boolean;
}

export function StudentPacingCard({ summary, onApplyPreset, isApplyingPreset }: StudentPacingCardProps) {
  const { user } = useAuth();
  const currency = user?.currency || "₹";

  const {
    totalBudgeted = 0,
    totalSpentInBudgets = 0,
    totalRemaining = 0,
    overallPercentage = 0,
    daysRemaining = 1,
    weeksRemaining = 1,
    safeDailyAllowance = 0,
    safeWeeklyAllowance = 0,
  } = summary || {};

  const isOverpacing = overallPercentage >= 85;

  return (
    <div className="bg-gradient-to-br from-[#FFFFFF] via-[#FAF8F5] to-[#F5EFE6] dark:from-[#201A1A] dark:via-[#1A1414] dark:to-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl p-6 shadow-md relative overflow-hidden space-y-5">
      {/* Background Glow Effect */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#810100]/5 dark:bg-[#810100]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DBD0]/60 dark:border-[#3B3030]/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#810100] to-[#A30100] flex items-center justify-center text-white shadow-sm shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-[#141010] dark:text-[#FAF8F5] tracking-tight">
                Monthly Budget Pacing Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                Pacing Active
              </span>
            </div>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] font-medium mt-0.5">
              Dynamic daily & weekly allowance tracking based on your active budgets
            </p>
          </div>
        </div>

        {onApplyPreset && (
          <button
            onClick={onApplyPreset}
            disabled={isApplyingPreset}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-[#141010] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#141010] hover:bg-black dark:hover:bg-white shadow-sm transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>{isApplyingPreset ? "Applying Template..." : "Load Budget Template"}</span>
          </button>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget & Remaining */}
        <div className="bg-[#FFFFFF]/80 dark:bg-[#141010]/80 border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#594D4D]">Total Budget Allocation</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-[#141010] dark:text-[#FAF8F5] tabular-nums">
              {currency}{totalBudgeted.toLocaleString()}
            </span>
            <span className="text-xs font-extrabold text-[#594D4D]">
              Spent: {currency}{totalSpentInBudgets.toLocaleString()}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#FAF8F5] dark:bg-[#201A1A] h-2 rounded-full overflow-hidden border border-[#E2DBD0] dark:border-[#3B3030] mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage > 100
                  ? "bg-rose-600"
                  : overallPercentage >= 80
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-emerald-600 to-teal-500"
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Safe Daily Allowance */}
        <div className="bg-[#FFFFFF]/80 dark:bg-[#141010]/80 border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#594D4D]">Safe Daily Spending</span>
            <span className="text-[10px] font-extrabold text-[#594D4D] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#810100]" /> {daysRemaining} days left
            </span>
          </div>
          <div className="text-2xl font-black text-[#810100] dark:text-[#FAF8F5] tabular-nums">
            {currency}{safeDailyAllowance.toLocaleString()}<span className="text-xs font-bold text-[#594D4D]"> / day</span>
          </div>
          <p className="text-[11px] text-[#594D4D] font-medium">Max safe spend per day to stay within budget</p>
        </div>

        {/* Safe Weekly Allowance */}
        <div className="bg-[#FFFFFF]/80 dark:bg-[#141010]/80 border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#594D4D]">Safe Weekly Allowance</span>
            <span className="text-[10px] font-extrabold text-[#594D4D]">{weeksRemaining} weeks remaining</span>
          </div>
          <div className="text-2xl font-black text-[#141010] dark:text-[#FAF8F5] tabular-nums">
            {currency}{safeWeeklyAllowance.toLocaleString()}<span className="text-xs font-bold text-[#594D4D]"> / week</span>
          </div>
          <p className="text-[11px] text-[#594D4D] font-medium">Weekly cap for discretionary expenses</p>
        </div>
      </div>

      {/* Pacing Advice Banner */}
      <div className="flex items-center gap-3 p-3.5 bg-[#FFFFFF]/90 dark:bg-[#141010]/90 border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl text-xs">
        {isOverpacing ? (
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        )}
        <div className="flex-1 font-semibold text-[#141010] dark:text-[#FAF8F5]">
          {isOverpacing ? (
            <span>
              <strong>Overpacing Alert:</strong> You have used {overallPercentage}% of your configured budget. Limit discretionary spending to preserve your remaining {currency}{totalRemaining.toLocaleString()}.
            </span>
          ) : (
            <span>
              <strong>Budget On Track:</strong> You have {currency}{totalRemaining.toLocaleString()} remaining. Stick to a max of {currency}{safeDailyAllowance}/day for discretionary expenses.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
