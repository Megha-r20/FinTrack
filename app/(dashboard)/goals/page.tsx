"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function GoalsPage() {
  const { user } = useAuth();
  const currency = user?.currency || "₹";
  const { showToast } = useToast();

  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("Savings");
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Contribution Modal State
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [contribAmount, setContribAmount] = useState("");
  const [contribNote, setContribNote] = useState("");
  const [submittingContrib, setSubmittingContrib] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !deadline) return;

    setSubmittingGoal(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          targetAmount: parseFloat(targetAmount),
          currentAmount: parseFloat(currentAmount || "0"),
          deadline,
          category,
        }),
      });

      if (res.ok) {
        showToast("Financial Goal created!", "success");
        setIsGoalModalOpen(false);
        setTitle("");
        setTargetAmount("");
        setCurrentAmount("0");
        fetchGoals();
      }
    } catch {
      showToast("Error creating goal", "error");
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal || !contribAmount || parseFloat(contribAmount) <= 0) return;

    setSubmittingContrib(true);
    try {
      const res = await fetch(`/api/goals/${activeGoal.id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(contribAmount),
          note: contribNote,
        }),
      });

      if (res.ok) {
        showToast(`Logged ${currency}${contribAmount} contribution!`, "success");
        setIsContribModalOpen(false);
        setContribAmount("");
        setContribNote("");
        fetchGoals();
      }
    } catch {
      showToast("Error adding contribution", "error");
    } finally {
      setSubmittingContrib(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1B1717] dark:text-[#EDEBDD]">
            Financial Goals
          </h1>
          <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
            Define target reserves, tech upgrades, and track deposit progress toward key milestones.
          </p>
        </div>

        <button
          onClick={() => setIsGoalModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const isDone = goal.status === "COMPLETED" || goal.percentageCompleted >= 100;

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                isDone
                  ? "border-emerald-500/60 ring-1 ring-emerald-500/20"
                  : "border-[#E6E1D3] dark:border-[#382D2D]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FAF9F5] dark:bg-[#1B1717] text-[#1B1717] dark:text-[#EDEBDD] border border-[#E6E1D3] dark:border-[#382D2D]">
                    {goal.category}
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#7A6E6E]">
                      <Clock className="w-3 h-3" /> Due {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-[#1B1717] dark:text-[#EDEBDD]">{goal.title}</h3>
                <div className="mt-2 text-2xl font-black text-[#1B1717] dark:text-[#EDEBDD]">
                  {currency}{goal.currentAmount.toLocaleString()}{" "}
                  <span className="text-xs font-semibold text-[#7A6E6E]">
                    / {currency}{goal.targetAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-[#4A3F3F] dark:text-[#C8BFB0]">{goal.percentageCompleted}% Target Reached</span>
                  <span className="text-[#810100] dark:text-[#EDEBDD]">
                    {currency}{goal.remainingAmount.toLocaleString()} needed
                  </span>
                </div>
                <div className="w-full bg-[#E6E1D3] dark:bg-[#382D2D] h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? "bg-emerald-500" : "bg-[#810100]"
                    }`}
                    style={{ width: `${goal.percentageCompleted}%` }}
                  />
                </div>
              </div>

              {!isDone && (
                <button
                  onClick={() => {
                    setActiveGoal(goal);
                    setIsContribModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold bg-[#FAF9F5] hover:bg-[#E6E1D3]/50 dark:bg-[#1B1717] dark:hover:bg-[#302929] text-[#1B1717] dark:text-[#EDEBDD] transition-colors border border-[#E6E1D3] dark:border-[#382D2D]"
                >
                  + Add Contribution Deposit
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Goal Creator Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#252020] rounded-3xl shadow-2xl border border-[#E6E1D3] dark:border-[#382D2D] p-6 space-y-4">
            <h3 className="text-lg font-black text-[#1B1717] dark:text-[#EDEBDD]">Create Financial Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#7A6E6E] mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Reserve / New Laptop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1B1717] border border-[#E6E1D3] dark:border-[#382D2D] rounded-xl text-xs font-semibold text-[#1B1717] dark:text-[#EDEBDD] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7A6E6E] mb-1">Target Amount</label>
                  <input
                    type="number"
                    required
                    placeholder="100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1B1717] border border-[#E6E1D3] dark:border-[#382D2D] rounded-xl text-xs font-semibold text-[#1B1717] dark:text-[#EDEBDD] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7A6E6E] mb-1">Initial Deposit</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1B1717] border border-[#E6E1D3] dark:border-[#382D2D] rounded-xl text-xs font-semibold text-[#1B1717] dark:text-[#EDEBDD] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#7A6E6E] mb-1">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1B1717] border border-[#E6E1D3] dark:border-[#382D2D] rounded-xl text-xs font-semibold text-[#1B1717] dark:text-[#EDEBDD] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#7A6E6E] hover:bg-[#FAF9F5] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGoal}
                  className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow"
                >
                  {submittingGoal ? "Creating..." : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Logger Modal */}
      {isContribModalOpen && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#252020] rounded-3xl shadow-2xl border border-[#E6E1D3] dark:border-[#382D2D] p-6 space-y-4">
            <h3 className="text-lg font-black text-[#1B1717] dark:text-[#EDEBDD]">
              Log Deposit for "{activeGoal.title}"
            </h3>
            <form onSubmit={handleAddContribution} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#7A6E6E] mb-1">Contribution Amount</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1B1717] border border-[#E6E1D3] dark:border-[#382D2D] rounded-xl text-sm font-bold text-[#1B1717] dark:text-[#EDEBDD] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#7A6E6E] mb-1">Note / Source</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly salary savings transfer"
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F5] dark:bg-[#1B1717] border border-[#E6E1D3] dark:border-[#382D2D] rounded-xl text-xs font-semibold text-[#1B1717] dark:text-[#EDEBDD] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContribModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#7A6E6E] hover:bg-[#FAF9F5] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingContrib}
                  className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow"
                >
                  {submittingContrib ? "Logging..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
