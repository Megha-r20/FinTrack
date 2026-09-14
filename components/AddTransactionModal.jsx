"use client";
import React, { useState, useEffect } from "react";
import { X, Plus, Calendar, Tag, CreditCard, FileText, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useToast } from "@/context/ToastContext";
export function AddTransactionModal({ isOpen, onClose, onSuccess }) {
    const [type, setType] = useState("EXPENSE");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [notes, setNotes] = useState("");
    const [categories, setCategories] = useState([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);
    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
                const filtered = data.categories?.filter((c) => c.type === type);
                if (filtered && filtered.length > 0) {
                    setCategoryId(filtered[0].id);
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        const filtered = categories.filter((c) => c.type === type);
        if (filtered.length > 0) {
            setCategoryId(filtered[0].id);
        }
    }, [type, categories]);
    const handleCreateCategory = async () => {
        if (!newCatName.trim())
            return;
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCatName.trim(), type }),
            });
            if (res.ok) {
                const data = await res.json();
                setCategories((prev) => [...prev, data.category]);
                setCategoryId(data.category.id);
                setNewCatName("");
                setIsCreatingCategory(false);
                showToast(`Category "${data.category.name}" created!`, "success");
            }
            else {
                const err = await res.json();
                showToast(err.error || "Failed to create category", "error");
            }
        }
        catch {
            showToast("Error creating category", "error");
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description || !categoryId) {
            showToast("Please fill in all required fields", "warning");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    type,
                    categoryId,
                    date,
                    description,
                    paymentMethod,
                    notes,
                }),
            });
            if (res.ok) {
                showToast(`${type === "INCOME" ? "Income" : "Expense"} added successfully!`, "success");
                setAmount("");
                setDescription("");
                setNotes("");
                onSuccess();
                onClose();
            }
            else {
                const err = await res.json();
                showToast(err.error || "Failed to add transaction", "error");
            }
        }
        catch {
            showToast("Error submitting transaction", "error");
        }
        finally {
            setSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    const filteredCategories = categories.filter((c) => c.type === type);
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DBD0] dark:border-[#3B3030]">
          <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">Record Transaction</h3>
          <button onClick={onClose} className="p-1 text-[#594D4D] hover:text-[#141010] dark:hover:text-[#FAF8F5] rounded-lg transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] dark:bg-[#141010] rounded-2xl border border-[#E2DBD0] dark:border-[#3B3030]">
            <button type="button" onClick={() => setType("EXPENSE")} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${type === "EXPENSE"
            ? "bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
            : "text-[#4A3F3F] dark:text-[#C8BFB0] hover:text-[#141010]"}`}>
              <ArrowDownLeft className="w-4 h-4"/>
              <span>Expense</span>
            </button>
            <button type="button" onClick={() => setType("INCOME")} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${type === "INCOME"
            ? "bg-emerald-600 text-white shadow-md"
            : "text-[#4A3F3F] dark:text-[#C8BFB0] hover:text-[#141010]"}`}>
              <ArrowUpRight className="w-4 h-4"/>
              <span>Income</span>
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#594D4D] mb-1.5">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#594D4D] font-bold text-lg">
                ₹
              </span>
              <input type="number" step="0.01" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-8 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl text-lg font-black text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#594D4D] mb-1.5">
              Description *
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]"/>
              <input type="text" required placeholder="e.g. Weekly Groceries / Salary" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#594D4D]">
                Category *
              </label>
              <button type="button" onClick={() => setIsCreatingCategory(!isCreatingCategory)} className="text-xs font-bold text-[#810100] dark:text-[#FAF8F5] hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3"/>
                <span>Custom Category</span>
              </button>
            </div>

            {isCreatingCategory ? (<div className="flex items-center gap-2 p-2 bg-[#FAF8F5] dark:bg-[#141010] rounded-xl border border-[#810100]/30">
                <input type="text" placeholder="Category Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="flex-1 px-3 py-1.5 bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-lg text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
                <button type="button" onClick={handleCreateCategory} className="px-3 py-1.5 bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-lg text-xs font-extrabold">
                  Save
                </button>
              </div>) : (<div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]"/>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5] focus:outline-none">
                  {filteredCategories.map((c) => (<option key={c.id} value={c.id}>
                      {c.name}
                    </option>))}
                </select>
              </div>)}
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#594D4D] mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]"/>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#594D4D] mb-1.5">
                Payment Method
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]"/>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5] focus:outline-none">
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button type="submit" disabled={submitting} className="w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-xl cherry-glow transition-all">
              {submitting ? "Saving..." : `Save ${type === "INCOME" ? "Income" : "Expense"}`}
            </button>
          </div>
        </form>
      </div>
    </div>);
}
