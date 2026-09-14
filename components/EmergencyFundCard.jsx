"use client";
import React, { useState, useEffect } from "react";
import { ShieldAlert, ArrowUpRight, ArrowDownRight, Settings } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export function EmergencyFundCard({ currency = "₹" }) {
  const { showToast } = useToast();
  const [data, setData] = useState({ balance: 0, percent: 5.0, logs: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState("DEPOSIT"); // "DEPOSIT" | "WITHDRAW" | "SET_PERCENT"
  const [amount, setAmount] = useState("");
  const [percentInput, setPercentInput] = useState("5.0");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchEmergencyFund = async () => {
    try {
      const res = await fetch("/api/emergency-fund");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setPercentInput(json.percent.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyFund();
  }, []);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/emergency-fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          amount: parseFloat(amount || 0),
          percent: parseFloat(percentInput || 5.0),
          note,
        }),
      });

      if (res.ok) {
        showToast("Emergency Reserve Fund updated!", "success");
        setIsModalOpen(false);
        setAmount("");
        setNote("");
        fetchEmergencyFund();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to update fund", "error");
      }
    } catch {
      showToast("Error updating emergency fund", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#e11d48] text-white flex items-center justify-center shadow-md">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-[#141010] dark:text-[#FAF8F5]">Emergency Reserve Fund</h3>
            <span className="text-xs text-[#594D4D] dark:text-[#C8BFB0]">Hostel Safety Cushion Bucket</span>
          </div>
        </div>

        <button
          onClick={() => {
            setActionType("SET_PERCENT");
            setIsModalOpen(true);
          }}
          className="p-2 rounded-xl text-[#594D4D] hover:bg-[#FAF8F5] dark:hover:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] transition-colors"
          title="Configure Auto-Allocation %"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#594D4D]">Total Reserve Balance</span>
          <div className="text-2xl font-black text-[#e11d48] mt-1 tabular-nums">
            {currency}{data.balance.toLocaleString()}
          </div>
          <span className="text-[10px] font-medium text-[#594D4D]">Protected from routine spending</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#594D4D]">Auto-Allocation</span>
          <div className="text-2xl font-black text-[#141010] dark:text-[#FAF8F5] mt-1 tabular-nums">
            {data.percent}% <span className="text-xs text-[#594D4D] font-bold">of monthly budget</span>
          </div>
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 font-semibold">
            Auto-saves {currency}{Math.round((6000 * data.percent) / 100)}/mo
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DBD0]/60 dark:border-[#3B3030]/60">
        <button
          onClick={() => {
            setActionType("WITHDRAW");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-extrabold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>Withdraw Dues</span>
        </button>

        <button
          onClick={() => {
            setActionType("DEPOSIT");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Deposit Funds</span>
        </button>
      </div>

      {/* Emergency Fund Action Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-4">
            <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">
              {actionType === "DEPOSIT"
                ? "Deposit to Emergency Reserve"
                : actionType === "WITHDRAW"
                ? "Withdraw Emergency Funds"
                : "Configure Auto-Allocation %"}
            </h3>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              {actionType === "SET_PERCENT" ? (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">
                    Monthly Reserve Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    required
                    value={percentInput}
                    onChange={(e) => setPercentInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-base font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                  />
                  <p className="text-[11px] text-[#594D4D] mt-1">
                    FinTrack automatically calculates safe reserve targets based on your ₹6,000 allowance.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#594D4D] font-bold text-lg">
                        {currency}
                      </span>
                      <input
                        type="number"
                        step="50"
                        required
                        placeholder="500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-lg font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Note / Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Medical emergency or hostel deposit refund"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] dark:hover:bg-[#141010] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow"
                >
                  {submitting ? "Saving..." : "Confirm Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
