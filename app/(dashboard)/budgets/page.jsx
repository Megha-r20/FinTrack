"use client";
import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle, Sparkles, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { CategoryIcon } from "@/components/CategoryIcon";
import { StudentPacingCard } from "@/components/StudentPacingCard";

export default function BudgetsPage() {
    const { user } = useAuth();
    const currency = user?.currency || "₹";
    const { showToast } = useToast();
    const [budgetsData, setBudgetsData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingPreset, setApplyingPreset] = useState(false);
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCatId, setSelectedCatId] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");
    const [editingBudgetName, setEditingBudgetName] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/budgets");
            if (res.ok) {
                setBudgetsData(await res.json());
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                const expenseOnly = data.categories?.filter((c) => c.type === "EXPENSE") || [];
                setCategories(expenseOnly);
                if (expenseOnly.length > 0)
                    setSelectedCatId(expenseOnly[0].id);
            }
        }
        catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBudgets();
        fetchCategories();
    }, []);

    const openEditModal = (b) => {
        setSelectedCatId(b.categoryId);
        setBudgetAmount(b.budgetAmount.toString());
        setEditingBudgetName(b.categoryName);
        setIsModalOpen(true);
    };

    const openNewModal = () => {
        setEditingBudgetName("");
        if (categories.length > 0) setSelectedCatId(categories[0].id);
        setBudgetAmount("");
        setIsModalOpen(true);
    };

    const handleDeleteBudget = async (id, categoryName) => {
        if (!confirm(`Are you sure you want to remove the budget limit for "${categoryName}"?`)) return;
        try {
            const res = await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast(`Budget for ${categoryName} removed`, "success");
                fetchBudgets();
            } else {
                showToast("Failed to delete budget", "error");
            }
        } catch {
            showToast("Error deleting budget", "error");
        }
    };

    const handleApplyHostelPreset = async () => {
        setApplyingPreset(true);
        try {
            const hostelTemplateItems = [
                { categoryName: "Snacks & Mess Outings", amount: 1500, color: "#ef4444", icon: "Utensils" },
                { categoryName: "Transport", amount: 800, color: "#f59e0b", icon: "Car" },
                { categoryName: "Mobile & Data Recharge", amount: 300, color: "#06b6d4", icon: "Smartphone" },
                { categoryName: "Personal Care & Toiletries", amount: 500, color: "#ec4899", icon: "Sparkles" },
                { categoryName: "Entertainment", amount: 600, color: "#10b981", icon: "Film" },
                { categoryName: "Education", amount: 500, color: "#3b82f6", icon: "GraduationCap" },
                { categoryName: "Emergency Fund", amount: 800, color: "#e11d48", icon: "ShieldAlert" },
                { categoryName: "Shopping", amount: 1000, color: "#a855f7", icon: "ShoppingBag" },
            ];
            const res = await fetch("/api/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bulk: true,
                    items: hostelTemplateItems,
                }),
            });
            if (res.ok) {
                showToast("Hostel Student ₹6,000 Budget Template applied!", "success");
                await fetchBudgets();
                await fetchCategories();
            }
            else {
                showToast("Failed to apply budget template", "error");
            }
        }
        catch {
            showToast("Error applying budget template", "error");
        }
        finally {
            setApplyingPreset(false);
        }
    };

    const handleSaveBudget = async (e) => {
        e.preventDefault();
        if (!selectedCatId || !budgetAmount || parseFloat(budgetAmount) <= 0)
            return;
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
                setEditingBudgetName("");
                fetchBudgets();
            }
            else {
                const err = await res.json();
                showToast(err.error || "Failed to update budget", "error");
            }
        }
        catch {
            showToast("Error updating budget", "error");
        }
        finally {
            setSaving(false);
        }
    };

    const summary = budgetsData?.summary || {
        totalBudgeted: 0,
        totalSpentInBudgets: 0,
        totalRemaining: 0,
        overallPercentage: 0,
        daysRemaining: 1,
        weeksRemaining: 1,
        safeDailyAllowance: 0,
        safeWeeklyAllowance: 0,
    };
    const budgetsList = budgetsData?.budgets || [];

    return (<div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#141010] dark:text-[#FAF8F5]">
            Category Budgets & Safe Pacing
          </h1>
          <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
            Manage your ₹6,000 monthly hostel allowance and track daily safe spend limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleApplyHostelPreset} disabled={applyingPreset} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF8F5] dark:bg-[#201A1A] text-[#141010] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] hover:bg-[#E2DBD0]/40 transition-colors shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500"/>
            <span>{applyingPreset ? "Applying..." : "Hostel ₹6k Preset"}</span>
          </button>

          <button onClick={openNewModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow">
            <Plus className="w-4 h-4"/>
            <span>Set Category Limit</span>
          </button>
        </div>
      </div>

      {/* Hostel Student Pacing Card */}
      <StudentPacingCard summary={summary} onApplyPreset={handleApplyHostelPreset} isApplyingPreset={applyingPreset}/>

      {/* Budgets Grid Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#594D4D]">Category Allocations</h2>
        <span className="text-xs font-bold text-[#594D4D]">{budgetsList.length} Active Categories</span>
      </div>

      {/* Budgets Grid */}
      {loading ? (<div className="p-12 text-center text-xs font-medium text-[#594D4D] animate-pulse">
          Loading budget allocations...
        </div>) : budgetsList.length === 0 ? (<div className="p-12 text-center bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] flex items-center justify-center mx-auto text-[#810100]">
            <Sparkles className="w-6 h-6"/>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#141010] dark:text-[#FAF8F5]">No category budgets set yet</h3>
            <p className="text-xs text-[#594D4D] max-w-md mx-auto font-medium">
              Click <strong>Hostel ₹6k Preset</strong> above to automatically setup recommended allocations for snacks, transport, mobile recharge, personal care, education, and savings.
            </p>
          </div>
          <button onClick={handleApplyHostelPreset} disabled={applyingPreset} className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400"/>
            <span>Load ₹6,000 Hostel Template Now</span>
          </button>
        </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgetsList.map((b) => {
                const isWarning = b.percentageUsed >= 80 && b.percentageUsed <= 100;
                const isExceeded = b.percentageUsed > 100;
                return (<div key={b.id} className={`p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border transition-all shadow-sm space-y-4 flex flex-col justify-between ${isExceeded
                        ? "border-rose-500/80 ring-1 ring-rose-500/30"
                        : isWarning
                            ? "border-amber-500/80 ring-1 ring-amber-500/30"
                            : "border-[#E2DBD0] dark:border-[#3B3030]"}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: b.categoryColor || "#810100" }}>
                        <CategoryIcon iconName={b.categoryIcon || "Tag"} className="w-5 h-5"/>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#141010] dark:text-[#FAF8F5]">{b.categoryName}</h3>
                        <span className="text-[11px] text-[#594D4D]">Monthly Cap</span>
                      </div>
                    </div>

                    {isExceeded && (<span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3"/> Exceeded
                      </span>)}
                    {isWarning && (<span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3"/> Near Limit
                      </span>)}
                    {!isWarning && !isExceeded && (<span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        On Track
                      </span>)}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#4A3F3F] dark:text-[#C8BFB0] tabular-nums">
                        {currency}{b.spentAmount.toLocaleString()} spent
                      </span>
                      <span className="text-[#594D4D] tabular-nums">
                        {currency}{b.budgetAmount.toLocaleString()} limit
                      </span>
                    </div>

                    <div className="w-full bg-[#E2DBD0] dark:bg-[#3B3030] h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${isExceeded ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-[#810100]"}`} style={{ width: `${Math.min(100, b.percentageUsed)}%` }}/>
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

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2DBD0]/60 dark:border-[#3B3030]/60 mt-2">
                  <button onClick={() => openEditModal(b)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#810100] dark:text-[#E53835] bg-[#810100]/10 hover:bg-[#810100]/20 transition-colors">
                    <Pencil className="w-3.5 h-3.5"/>
                    <span>Edit Limit</span>
                  </button>
                  <button onClick={() => handleDeleteBudget(b.id, b.categoryName)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5"/>
                    <span>Delete</span>
                  </button>
                </div>
              </div>);
            })}
        </div>)}

      {/* Set / Edit Budget Modal */}
      {isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-4">
            <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">
              {editingBudgetName ? `Edit Budget - ${editingBudgetName}` : "Set Category Budget Limit"}
            </h3>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Select Category</label>
                <select value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)} disabled={!!editingBudgetName} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-sm font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none disabled:opacity-75">
                  {categories.map((c) => (<option key={c.id} value={c.id}>
                      {c.name}
                    </option>))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Monthly Limit Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#594D4D] font-bold text-lg">{currency}</span>
                  <input type="number" step="50" required placeholder="1500" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} className="w-full pl-8 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-lg font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingBudgetName(""); }} className="px-4 py-2 text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] dark:hover:bg-[#141010] rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow">
                  {saving ? "Saving..." : "Save Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
