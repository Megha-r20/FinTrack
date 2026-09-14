"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  Sparkles,
  Bot,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const currency = user?.currency || "₹";

  const [period, setPeriod] = useState("THIS_MONTH");
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, goalsRes, txRes, aiRes] = await Promise.all([
        fetch(`/api/analytics?period=${period}`),
        fetch("/api/goals"),
        fetch("/api/transactions?limit=5"),
        fetch("/api/ai/advisor"),
      ]);

      if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
      if (goalsRes.ok) {
        const gData = await goalsRes.json();
        setGoals(gData.goals || []);
      }
      if (txRes.ok) {
        const tData = await txRes.json();
        setRecentTx(tData.transactions || []);
      }
      if (aiRes.ok) setAiInsights(await aiRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  useEffect(() => {
    const handleUpdate = () => fetchData();
    window.addEventListener("fintrack_data_updated", handleUpdate);
    return () => window.removeEventListener("fintrack_data_updated", handleUpdate);
  }, [period]);

  const summary = analyticsData?.summary || { totalIncome: 0, totalExpenses: 0, netSavings: 0, savingsRate: 0 };
  const totalBalance = (summary.totalIncome || 0) - (summary.totalExpenses || 0);

  const CHERRY_PALETTE = ["#810100", "#630000", "#9E100E", "#B22222", "#4A0000", "#D32F2F", "#8B0000"];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Time Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1B1717] dark:text-[#EDEBDD]">
            Welcome back, {user?.name || "Megha R"}
          </h1>
          <p className="text-xs md:text-sm text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-1">
            FinTrack Intelligence • Real-time metrics and cash flow analysis.
          </p>
        </div>

        {/* Time Period Filter Pills */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] rounded-2xl shadow-sm overflow-x-auto">
          {[
            { id: "THIS_WEEK", label: "This Week" },
            { id: "THIS_MONTH", label: "This Month" },
            { id: "LAST_MONTH", label: "Last Month" },
            { id: "LAST_3_MONTHS", label: "Last 3M" },
            { id: "THIS_YEAR", label: "This Year" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                period === item.id
                  ? "bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
                  : "text-[#4A3F3F] dark:text-[#C8BFB0] hover:text-[#1B1717] dark:hover:text-[#EDEBDD]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#810100] via-[#630000] to-[#810100] text-white border border-[#810100]/60 shadow-xl cherry-glow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-[#EDEBDD]/90 uppercase">Total Balance</span>
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black tracking-tight">
              {currency}{totalBalance.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#EDEBDD]/80 font-semibold">
            Cumulative Net Capital
          </div>
        </div>

        {/* Total Income Card */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-[#4A3F3F] dark:text-[#C8BFB0] uppercase">Total Income</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {currency}{(summary.totalIncome || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A6E6E] dark:text-[#8C8080] font-medium">
            Inflow for selected period
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-[#4A3F3F] dark:text-[#C8BFB0] uppercase">Total Expenses</span>
            <div className="w-9 h-9 rounded-2xl bg-[#810100]/10 text-[#810100] dark:text-[#E53835] flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#810100] dark:text-[#E53835]">
              {currency}{(summary.totalExpenses || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A6E6E] dark:text-[#8C8080] font-medium">
            Outflow for selected period
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-[#4A3F3F] dark:text-[#C8BFB0] uppercase">Savings Rate</span>
            <div className="w-9 h-9 rounded-2xl bg-[#810100]/10 text-[#810100] dark:text-[#EDEBDD] flex items-center justify-center font-bold">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#1B1717] dark:text-[#EDEBDD]">
              {currency}{(summary.netSavings || 0).toLocaleString()}
            </span>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#810100]/15 text-[#810100] dark:text-[#EDEBDD] border border-[#810100]/30">
              {summary.savingsRate}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#7A6E6E] dark:text-[#8C8080] font-medium">
            Net saved percentage
          </div>
        </div>
      </div>

      {/* AI Financial Snapshot Card */}
      {aiInsights && aiInsights.insights && aiInsights.insights.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#810100] via-[#630000] to-[#810100] dark:from-[#252020] dark:via-[#1B1717] dark:to-[#252020] text-white dark:text-[#EDEBDD] border border-[#810100]/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 dark:bg-[#EDEBDD]/20 text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white dark:text-[#EDEBDD]">FinTrack AI Advisor Insights</h3>
                <p className="text-xs text-white/80 dark:text-[#C8BFB0]">Automated observations grounded in your transaction history</p>
              </div>
            </div>
            <Link
              href="/ai-advisor"
              className="flex items-center gap-1 text-xs font-extrabold text-white dark:text-[#EDEBDD] hover:underline"
            >
              <span>Ask AI Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiInsights.insights.map((insight: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-black/20 dark:bg-[#1B1717]/80 border border-white/20 dark:border-[#382D2D] backdrop-blur-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-white dark:text-[#EDEBDD] mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-white dark:text-[#E53835]" />
                  <span>{insight.title}</span>
                </div>
                <p className="text-xs text-white/90 dark:text-[#C8BFB0] leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#1B1717] dark:text-[#EDEBDD]">Monthly Cash Flow</h3>
              <p className="text-xs text-[#7A6E6E] dark:text-[#8C8080]">Income vs Expenses (Last 6 Months)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {analyticsData?.monthlyTrend && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.monthlyTrend}>
                  <XAxis dataKey="month" stroke={theme === "dark" ? "#887B7B" : "#7A6E6E"} fontSize={11} />
                  <YAxis stroke={theme === "dark" ? "#887B7B" : "#7A6E6E"} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1B1717" : "#FFFFFF",
                      borderColor: theme === "dark" ? "#382D2D" : "#E6E1D3",
                      borderRadius: "14px",
                      color: theme === "dark" ? "#EDEBDD" : "#1B1717",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="#810100" radius={[6, 6, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown Pie Chart */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#1B1717] dark:text-[#EDEBDD]">Category Outflow</h3>
            <p className="text-xs text-[#7A6E6E] dark:text-[#8C8080]">Top spending categories</p>
          </div>

          <div className="h-52 w-full my-2">
            {analyticsData?.categoryBreakdown && analyticsData.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.categoryBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {analyticsData.categoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHERRY_PALETTE[index % CHERRY_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `${currency}${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1B1717" : "#FFFFFF",
                      borderColor: theme === "dark" ? "#382D2D" : "#E6E1D3",
                      borderRadius: "14px",
                      color: theme === "dark" ? "#EDEBDD" : "#1B1717",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#7A6E6E]">
                No expense entries logged for this period
              </div>
            )}
          </div>

          {/* Mini Legend List */}
          <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
            {analyticsData?.categoryBreakdown?.slice(0, 4).map((cat: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHERRY_PALETTE[idx % CHERRY_PALETTE.length] }} />
                  <span className="font-bold text-[#4A3F3F] dark:text-[#C8BFB0]">{cat.name}</span>
                </div>
                <span className="font-black text-[#1B1717] dark:text-[#EDEBDD]">
                  {currency}{cat.amount.toLocaleString()} ({cat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Financial Goals & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Goals Progress */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#1B1717] dark:text-[#EDEBDD]">Financial Goals</h3>
            <Link href="/goals" className="text-xs font-extrabold text-[#810100] dark:text-[#EDEBDD] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="p-4 rounded-2xl bg-[#FAF9F5] dark:bg-[#1B1717]/60 border border-[#E6E1D3] dark:border-[#382D2D] space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#1B1717] dark:text-[#EDEBDD]">
                  <span>{goal.title}</span>
                  <span className="text-[#810100] dark:text-[#EDEBDD]">{goal.percentageCompleted}%</span>
                </div>
                <div className="w-full bg-[#E6E1D3] dark:bg-[#382D2D] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#810100] h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.percentageCompleted}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#7A6E6E] dark:text-[#8C8080] font-semibold">
                  <span>
                    Saved: {currency}{goal.currentAmount.toLocaleString()}
                  </span>
                  <span>Target: {currency}{goal.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#1B1717] dark:text-[#EDEBDD]">Recent Activity</h3>
            <Link href="/transactions" className="text-xs font-extrabold text-[#810100] dark:text-[#EDEBDD] hover:underline">
              View All Transactions
            </Link>
          </div>

          <div className="divide-y divide-[#E6E1D3]/50 dark:divide-[#382D2D]">
            {recentTx.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: tx.category?.color || "#810100" }}
                  >
                    <CategoryIcon iconName={tx.category?.icon || "Tag"} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs md:text-sm text-[#1B1717] dark:text-[#EDEBDD]">{tx.description}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-[#7A6E6E] dark:text-[#8C8080]">
                      <span>{tx.category?.name}</span>
                      <span>•</span>
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] dark:bg-[#1B1717] font-semibold border border-[#E6E1D3] dark:border-[#382D2D]">
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`font-black text-sm md:text-base ${
                    tx.type === "INCOME" ? "text-emerald-700 dark:text-emerald-400" : "text-[#810100] dark:text-[#EDEBDD]"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "-"}
                  {currency}
                  {tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
