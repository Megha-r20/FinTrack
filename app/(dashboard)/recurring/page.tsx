"use client";

import React, { useState, useEffect } from "react";
import { Plus, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function RecurringPage() {
  const { user } = useAuth();
  const currency = user?.currency || "₹";
  const { showToast } = useToast();

  const [recurringItems, setRecurringItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [nextDueDate, setNextDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recurring");
      if (res.ok) {
        const data = await res.json();
        setRecurringItems(data.recurring || []);
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
        setCategories(data.categories || []);
        if (data.categories?.length > 0) setCategoryId(data.categories[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecurring();
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryId || !nextDueDate) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          type,
          categoryId,
          frequency,
          nextDueDate,
        }),
      });

      if (res.ok) {
        showToast("Recurring transaction added!", "success");
        setIsModalOpen(false);
        setDescription("");
        setAmount("");
        fetchRecurring();
      }
    } catch {
      showToast("Error creating recurring entry", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#141010] dark:text-[#FAF8F5]">
            Recurring Bills & Income
          </h1>
          <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
            Automate tracking for broadband, Netflix, rent, and monthly salaries.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Item</span>
        </button>
      </div>

      <div className="bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] dark:bg-[#141010] border-b border-[#E2DBD0] dark:border-[#3B3030] text-[#594D4D] uppercase tracking-wider font-extrabold">
              <tr>
                <th className="py-4 px-5">Recurring Item</th>
                <th className="py-4 px-5">Frequency</th>
                <th className="py-4 px-5">Next Due Date</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DBD0]/50 dark:divide-[#3B3030] font-medium">
              {recurringItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#302929] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: item.category?.color || "#810100" }}
                      >
                        <CategoryIcon iconName={item.category?.icon || "Tag"} className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#141010] dark:text-[#FAF8F5] block">{item.description}</span>
                        <span className="text-[11px] text-[#594D4D]">{item.category?.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FAF8F5] dark:bg-[#141010] text-[#141010] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030]">
                      {item.frequency}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-[#4A3F3F] dark:text-[#C8BFB0] font-semibold">
                    {new Date(item.nextDueDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-5">
                    {item.isDueSoon ? (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3" /> Due in {item.daysUntilDue} days
                      </span>
                    ) : item.isOverdue ? (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#141010] text-[#594D4D] dark:text-[#A89F9F] border border-[#E2DBD0] dark:border-[#3B3030]">
                        Active
                      </span>
                    )}
                  </td>
                  <td
                    className={`py-4 px-5 text-right font-black text-sm ${
                      item.type === "INCOME" ? "text-emerald-700 dark:text-emerald-400" : "text-[#810100] dark:text-[#FAF8F5]"
                    }`}
                  >
                    {item.type === "INCOME" ? "+" : "-"}
                    {currency}
                    {item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-4">
            <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">Add Recurring Subscription / Income</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Subscription / House Rent"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    placeholder="649"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5]"
                  >
                    <option value="EXPENSE">Expense Bill</option>
                    <option value="INCOME">Income Salary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5]"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow"
                >
                  {submitting ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
