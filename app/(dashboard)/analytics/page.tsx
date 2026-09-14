"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Award } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const currency = user?.currency || "₹";

  const [period, setPeriod] = useState("THIS_MONTH");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const summary = data?.summary || { totalIncome: 0, totalExpenses: 0, netSavings: 0, savingsRate: 0 };
  const mom = data?.momComparison || { incomeMoM: 0, expenseMoM: 0, prevIncome: 0, prevExpenses: 0 };
  const COLORS = ["#6366f1", "#10b981", "#ef4444", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Financial Analytics & MoM Trends
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deep-dive visual breakdown of cash flow trends and month-over-month shifts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          {[
            { id: "THIS_MONTH", label: "This Month" },
            { id: "LAST_MONTH", label: "Last Month" },
            { id: "LAST_3_MONTHS", label: "Last 3M" },
            { id: "THIS_YEAR", label: "This Year" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === item.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* MoM Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income MoM */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Income Change (MoM)</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {currency}{summary.totalIncome.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400">Vs last month ({currency}{mom.prevIncome.toLocaleString()})</span>
          </div>

          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs ${
              mom.incomeMoM >= 0
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {mom.incomeMoM >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(mom.incomeMoM)}% MoM</span>
          </div>
        </div>

        {/* Expenses MoM */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expenses Change (MoM)</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {currency}{summary.totalExpenses.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400">Vs last month ({currency}{mom.prevExpenses.toLocaleString()})</span>
          </div>

          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs ${
              mom.expenseMoM <= 0
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {mom.expenseMoM >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(mom.expenseMoM)}% MoM</span>
          </div>
        </div>
      </div>

      {/* Savings Trend Area Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Savings & Net Flow Trend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track monthly capital retention over time</p>
        </div>

        <div className="h-64 w-full">
          {data?.monthlyTrend && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#savingsGrad)" name="Net Savings" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Grid: Category Outflow & Top Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Category Spending Distribution</h3>

          <div className="space-y-3">
            {data?.categoryBreakdown?.map((cat: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                  <span className="text-slate-900 dark:text-white">
                    {currency}{cat.amount.toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color || COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Largest Expenses */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Largest Outflow Entries</h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data?.topExpenses?.map((tx: any) => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{tx.description}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">
                  -{currency}{tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
