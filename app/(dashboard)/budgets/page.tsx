"use client";

import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function BudgetsPage() {
  const { user } = useAuth();
  const currency = user?.currency || "₹";
  const { showToast } = useToast();

  const [budgetsData, setBudgetsData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/budgets");
      if (res.ok) {
        setBudgetsData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        const expenseOnly = data.categories?.filter((c: any) => c.type === "EXPENSE") || [];
        setCategories(expenseOnly);
        if (expenseOnly.length > 0) setSelectedCatId(expenseOnly[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !budgetAmount || parseFloat(budgetAmount) <= 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCatId,
          amount: parseFloat(budgetAmount),
        }),
      });

      if (res.ok) {
        showToast("Category budget updated!", "success");
        setIsModalOpen(false);
        setBudgetAmount("");
        fetchBudgets();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to update budget", "error");
      }
    } catch {
      showToast("Error updating budget", "error");
    } finally {
      setSaving(false);
    }
  };

  const summary = budgetsData?.summary || { totalBudgeted: 0, totalSpentInBudgets: 0, totalRemaining: 0, overallPercentage: 0 };
  const budgetsList = budgetsData?.budgets || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#141010] dark:text-[#FAF8F5]">
            Category Budgets
          </h1>
          <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
            Monitor monthly expense caps and prevent budget overruns.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm">
          <span className="text-xs font-bold text-[#594D4D] uppercase tracking-wider">Total Monthly Budget</span>
          <div className="text-2xl font-black text-[#141010] dark:text-[#FAF8F5] mt-2">
            {currency}{summary.totalBudgeted.toLocaleString()}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm">
          <span className="text-xs font-bold text-[#594D4D] uppercase tracking-wider">Total Spent</span>
          <div className="text-2xl font-black text-[#810100] dark:text-[#E53835] mt-2">
            {currency}{summary.totalSpentInBudgets.toLocaleString()}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm">
          <span className="text-xs font-bold text-[#594D4D] uppercase tracking-wider">Overall Utilization</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-[#810100] dark:text-[#FAF8F5]">
              {summary.overallPercentage}%
            </span>
            <span className="text-xs font-semibold text-[#594D4D]">
              {currency}{summary.totalRemaining.toLocaleString()} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetsList.map((b: any) => {
          const isWarning = b.percentageUsed >= 80 && b.percentageUsed <= 100;
          const isExceeded = b.percentageUsed > 100;

          return (
            <div
              key={b.id}
              className={`p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border transition-all shadow-sm space-y-4 ${
                isExceeded
                  ? "border-rose-500/80 ring-1 ring-rose-500/30"
                  : isWarning
                  ? "border-amber-500/80 ring-1 ring-amber-500/30"
                  : "border-[#E2DBD0] dark:border-[#3B3030]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: b.categoryColor || "#810100" }}
                  >
                    <CategoryIcon iconName={b.categoryIcon || "Tag"} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#141010] dark:text-[#FAF8F5]">{b.categoryName}</h3>
                    <span className="text-[11px] text-[#594D4D]">Monthly Cap</span>
                  </div>
                </div>

                {isExceeded && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" /> Exceeded
                  </span>
                )}
                {isWarning && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3" /> Approaching Limit
                  </span>
                )}
                {!isWarning && !isExceeded && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    On Track
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#4A3F3F] dark:text-[#C8BFB0]">
                    {currency}{b.spentAmount.toLocaleString()} spent
                  </span>
                  <span className="text-[#594D4D]">
                    {currency}{b.budgetAmount.toLocaleString()} limit
                  </span>
                </div>

                <div className="w-full bg-[#E2DBD0] dark:bg-[#3B3030] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-[#810100]"
                    }`}
                    style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#594D4D] font-semibold pt-1">
                  <span>{b.percentageUsed}% used</span>
                  <span>
                    {b.remainingAmount < 0
                      ? `${currency}${Math.abs(b.remainingAmount).toLocaleString()} over budget`
                      : `${currency}${b.remainingAmount.toLocaleString()} left`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-4">
            <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">Set Category Budget Limit</h3>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Select Category</label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-sm font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Monthly Limit Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#594D4D] font-bold text-lg">₹</span>
                  <input
                    type="number"
                    step="100"
                    required
                    placeholder="5000"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-lg font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow"
                >
                  {saving ? "Saving..." : "Save Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
