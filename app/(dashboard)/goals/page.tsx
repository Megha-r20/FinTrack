"use client";

import React, { useState, useEffect } from "react";
import { Plus, Target, CheckCircle2, Calendar, DollarSign, Award, Clock } from "lucide-react";
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Goals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define target reserves, tech upgrades, and track progress toward key milestones.
          </p>
        </div>

        <button
          onClick={() => setIsGoalModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
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
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                isDone
                  ? "border-emerald-500/60 ring-1 ring-emerald-500/20"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {goal.category}
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Clock className="w-3 h-3" /> Due {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{goal.title}</h3>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {currency}{goal.currentAmount.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    / {currency}{goal.targetAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">{goal.percentageCompleted}% Target Reached</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {currency}{goal.remainingAmount.toLocaleString()} needed
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone ? "bg-emerald-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${goal.percentageCompleted}%` }}
                  />
                </div>
              </div>

              {/* Add Contribution Button */}
              {!isDone && (
                <button
                  onClick={() => {
                    setActiveGoal(goal);
                    setIsContribModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors"
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
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Financial Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Reserve / New Laptop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Target Amount</label>
                  <input
                    type="number"
                    required
                    placeholder="100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Initial Deposit</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGoal}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
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
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Log Deposit for "{activeGoal.title}"
            </h3>
            <form onSubmit={handleAddContribution} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Contribution Amount</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Note / Source</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly salary savings transfer"
                  value={contribNote}
                  onChange={(e) => setContribNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContribModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingContrib}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20"
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
