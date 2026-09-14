"use client";
import React, { useState } from "react";
import { Users, Plus, Trash2, CheckCircle, Calculator } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export function SharedExpenseModal({ isOpen, onClose, categories, currency = "₹", onExpenseCreated }) {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [participants, setParticipants] = useState([{ name: "Roommate 1" }]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const totalPeople = participants.length + 1; // User + roommates
  const calculatedMyShare = totalAmount && parseFloat(totalAmount) > 0
    ? (parseFloat(totalAmount) / totalPeople).toFixed(2)
    : "0.00";

  const handleAddParticipant = () => {
    setParticipants([...participants, { name: `Roommate ${participants.length + 1}` }]);
  };

  const handleRemoveParticipant = (idx) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  const handleParticipantNameChange = (idx, name) => {
    const updated = [...participants];
    updated[idx].name = name;
    setParticipants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !totalAmount || parseFloat(totalAmount) <= 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/shared-expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          totalAmount: parseFloat(totalAmount),
          categoryId,
          participants,
          notes,
        }),
      });

      if (res.ok) {
        showToast("Shared expense split & recorded!", "success");
        onClose();
        if (onExpenseCreated) onExpenseCreated();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to split expense", "error");
      }
    } catch {
      showToast("Error processing shared expense", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] text-white flex items-center justify-center shadow-md cherry-glow">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">Shared Expense Splitter</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0]">Split food orders or cab bills with hostel roommates.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Expense Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Friday Dinner Order & Snacks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-sm font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Total Bill Amount</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#594D4D] font-bold">{currency}</span>
                <input
                  type="number"
                  step="10"
                  required
                  placeholder="1200"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-sm font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-sm font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Split Calculation Card */}
          <div className="p-4 rounded-2xl bg-[#810100]/10 border border-[#810100]/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#141010] dark:text-[#FAF8F5]">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#810100]" />
                <span>Split amongst {totalPeople} people (You + {participants.length} roommates)</span>
              </span>
              <span className="text-[#810100] dark:text-[#E53835] font-black text-sm">
                Your Share: {currency}{calculatedMyShare}
              </span>
            </div>
            <p className="text-[11px] text-[#594D4D] dark:text-[#C8BFB0]">
              FinTrack will automatically log <strong>{currency}{calculatedMyShare}</strong> as your personal expense transaction.
            </p>
          </div>

          {/* Roommates List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-[#594D4D]">Roommates Splitting Bill</label>
              <button
                type="button"
                onClick={handleAddParticipant}
                className="text-xs font-extrabold text-[#810100] dark:text-[#E53835] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Roommate</span>
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {participants.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={p.name}
                    onChange={(e) => handleParticipantNameChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#594D4D] shrink-0">
                    Owes {currency}{calculatedMyShare}
                  </span>
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DBD0] dark:border-[#3B3030]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] dark:hover:bg-[#141010] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow inline-flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{saving ? "Splitting..." : "Record & Split Expense"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
