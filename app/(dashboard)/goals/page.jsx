"use client";
import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, Clock, Trophy, Flame, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function GoalsPage() {
    const { user } = useAuth();
    const currency = user?.currency || "₹";
    const { showToast } = useToast();
    const [goals, setGoals] = useState([]);
    const [challenges, setChallenges] = useState([]);
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
    const [activeGoal, setActiveGoal] = useState(null);
    const [contribAmount, setContribAmount] = useState("");
    const [contribNote, setContribNote] = useState("");
    const [submittingContrib, setSubmittingContrib] = useState(false);

    // Challenge Modal State
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
    const [challengeTitle, setChallengeTitle] = useState("");
    const [challengeTarget, setChallengeTarget] = useState("500");
    const [challengeDays, setChallengeDays] = useState("30");
    const [submittingChallenge, setSubmittingChallenge] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [goalsRes, challengeRes] = await Promise.all([
                fetch("/api/goals"),
                fetch("/api/challenges"),
            ]);
            if (goalsRes.ok) {
                const gData = await goalsRes.json();
                setGoals(gData.goals || []);
            }
            if (challengeRes.ok) {
                const cData = await challengeRes.json();
                setChallenges(cData.challenges || []);
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        if (!title || !targetAmount || !deadline)
            return;
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
                showToast("Financial goal created!", "success");
                setIsGoalModalOpen(false);
                setTitle("");
                setTargetAmount("");
                setCurrentAmount("0");
                setDeadline("");
                fetchData();
            }
            else {
                const err = await res.json();
                showToast(err.error || "Failed to create goal", "error");
            }
        }
        catch {
            showToast("Error creating goal", "error");
        }
        finally {
            setSubmittingGoal(false);
        }
    };

    const handleAddContribution = async (e) => {
        e.preventDefault();
        if (!activeGoal || !contribAmount || parseFloat(contribAmount) <= 0)
            return;
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
                fetchData();
            }
            else {
                const err = await res.json();
                showToast(err.error || "Failed to log contribution", "error");
            }
        }
        catch {
            showToast("Error logging contribution", "error");
        }
        finally {
            setSubmittingContrib(false);
        }
    };

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        if (!challengeTitle || !challengeTarget) return;
        setSubmittingChallenge(true);
        try {
            const res = await fetch("/api/challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: challengeTitle,
                    targetAmount: parseFloat(challengeTarget),
                    durationDays: parseInt(challengeDays, 10),
                }),
            });
            if (res.ok) {
                showToast("Custom Savings Challenge started!", "success");
                setIsChallengeModalOpen(false);
                setChallengeTitle("");
                fetchData();
            } else {
                showToast("Failed to create challenge", "error");
            }
        } catch {
            showToast("Error creating challenge", "error");
        } finally {
            setSubmittingChallenge(false);
        }
    };

    const handleProgressChallenge = async (id, addAmount) => {
        try {
            const res = await fetch("/api/challenges", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, addAmount }),
            });
            if (res.ok) {
                showToast("Challenge progress updated!", "success");
                fetchData();
            }
        } catch {
            showToast("Error updating challenge", "error");
        }
    };

    return (<div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#141010] dark:text-[#FAF8F5]">
            Financial Goals & Savings Challenges
          </h1>
          <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
            Track long-term milestone targets and enrollment in 7/30/90-day savings challenges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsChallengeModalOpen(true)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FAF8F5] dark:bg-[#201A1A] text-[#141010] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] hover:bg-[#E2DBD0]/40 transition-colors shadow-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>New Savings Challenge</span>
          </button>

          <button onClick={() => setIsGoalModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow">
            <Plus className="w-4 h-4"/>
            <span>Create Goal</span>
          </button>
        </div>
      </div>

      {/* Savings Challenges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#594D4D] flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Active Savings Challenges (7 / 30 / 90 Days)</span>
          </h2>
          <span className="text-xs font-bold text-[#594D4D]">{challenges.length} Active</span>
        </div>

        {challenges.length === 0 ? (
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] text-center space-y-2">
            <h3 className="text-sm font-extrabold text-[#141010] dark:text-[#FAF8F5]">No Active Challenges</h3>
            <p className="text-xs text-[#594D4D]">Start a 30-day "No-Swiggy" or "₹50 Daily Jar" challenge to build habits and earn badges.</p>
            <button onClick={() => setIsChallengeModalOpen(true)} className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Launch ₹500 Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {challenges.map((c) => {
              const pct = Math.min(100, Math.round((c.currentAmount / c.targetAmount) * 100));
              return (
                <div key={c.id} className="p-5 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {c.durationDays}-Day Challenge
                    </span>
                    <span className="text-xs font-black text-[#141010] dark:text-[#FAF8F5]">{pct}%</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-[#141010] dark:text-[#FAF8F5]">{c.title}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-[#594D4D]">
                      <span>Saved: {currency}{c.currentAmount}</span>
                      <span>Target: {currency}{c.targetAmount}</span>
                    </div>
                    <div className="w-full bg-[#E2DBD0] dark:bg-[#3B3030] h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-1">
                    <button
                      onClick={() => handleProgressChallenge(c.id, 50)}
                      disabled={c.status === "COMPLETED"}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-[#810100]/10 text-[#810100] dark:text-[#E53835] hover:bg-[#810100]/20"
                    >
                      {c.status === "COMPLETED" ? "Completed!" : `+${currency}50 Deposit`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Financial Goals Grid */}
      {loading ? (<div className="p-12 text-center text-xs font-medium text-[#594D4D] animate-pulse">
          Loading financial goals...
        </div>) : goals.length === 0 ? (<div className="p-12 text-center bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl space-y-3">
          <h3 className="text-base font-black text-[#141010] dark:text-[#FAF8F5]">No long-term targets set</h3>
          <p className="text-xs text-[#594D4D] max-w-md mx-auto">
            Set savings targets for gadgets, hostel security deposit, or emergency funds.
          </p>
        </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
                const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                const isCompleted = g.status === "COMPLETED" || percentage >= 100;
                return (<div key={g.id} className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#810100]/10 text-[#810100] dark:text-[#FAF8F5]">
                      {g.category}
                    </span>
                    {isCompleted ? (<span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3"/> Completed
                      </span>) : (<span className="flex items-center gap-1 text-[10px] font-extrabold text-[#594D4D]">
                        <Clock className="w-3 h-3"/> {new Date(g.deadline).toLocaleDateString()}
                      </span>)}
                  </div>

                  <h3 className="font-extrabold text-base text-[#141010] dark:text-[#FAF8F5]">{g.title}</h3>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#141010] dark:text-[#FAF8F5]">
                        {currency}{g.currentAmount.toLocaleString()} saved
                      </span>
                      <span className="text-[#594D4D]">
                        Target: {currency}{g.targetAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-[#E2DBD0] dark:bg-[#3B3030] h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#810100] to-[#630000] rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}/>
                    </div>

                    <span className="text-[11px] font-bold text-[#594D4D] block text-right">
                      {percentage}% achieved
                    </span>
                  </div>
                </div>

                {!isCompleted && (<button onClick={() => {
                        setActiveGoal(g);
                        setIsContribModalOpen(true);
                    }} className="w-full py-2.5 rounded-xl text-xs font-black bg-[#FAF8F5] dark:bg-[#141010] text-[#141010] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] hover:bg-[#810100] hover:text-white transition-all shadow-sm">
                    Log Deposit
                  </button>)}
              </div>);
            })}
        </div>)}

      {/* New Goal Modal */}
      {isGoalModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-4">
            <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">Create Financial Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Goal Title</label>
                <input type="text" required placeholder="e.g. Emergency Reserve / New Laptop" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Target Amount</label>
                  <input type="number" required placeholder="100000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Initial Deposit</label>
                  <input type="number" placeholder="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Target Deadline</label>
                <input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsGoalModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submittingGoal} className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow">
                  {submittingGoal ? "Creating..." : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* New Challenge Modal */}
      {isChallengeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-4">
            <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">Start Custom Savings Challenge</h3>
            <form onSubmit={handleCreateChallenge} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Challenge Name</label>
                <input type="text" required placeholder="e.g., 30-Day No Swiggy Challenge" value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Target Savings</label>
                  <input type="number" required placeholder="500" value={challengeTarget} onChange={(e) => setChallengeTarget(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Duration</label>
                  <select value={challengeDays} onChange={(e) => setChallengeDays(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none">
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsChallengeModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submittingChallenge} className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow">
                  {submittingChallenge ? "Starting..." : "Start Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Logger Modal */}
      {isContribModalOpen && activeGoal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-4">
            <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">
              Log Deposit for "{activeGoal.title}"
            </h3>
            <form onSubmit={handleAddContribution} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Contribution Amount</label>
                <input type="number" required placeholder="5000" value={contribAmount} onChange={(e) => setContribAmount(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-sm font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1">Note / Source</label>
                <input type="text" placeholder="e.g. Monthly salary savings transfer" value={contribNote} onChange={(e) => setContribNote(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"/>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsContribModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-[#594D4D] hover:bg-[#FAF8F5] rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submittingContrib} className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl shadow-md cherry-glow">
                  {submittingContrib ? "Logging..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
