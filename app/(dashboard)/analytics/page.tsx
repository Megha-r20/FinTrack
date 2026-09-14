"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
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
  const CHERRY_PALETTE = ["#810100", "#630000", "#9E100E", "#B22222", "#4A0000", "#D32F2F", "#8B0000"];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1B1717] dark:text-[#EDEBDD]">
            Financial Analytics & MoM Trends
          </h1>
          <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
            Deep-dive visual breakdown of cash flow trends and month-over-month shifts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] rounded-2xl shadow-sm">
          {[
            { id: "THIS_MONTH", label: "This Month" },
            { id: "LAST_MONTH", label: "Last Month" },
            { id: "LAST_3_MONTHS", label: "Last 3M" },
            { id: "THIS_YEAR", label: "This Year" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
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

      {/* MoM Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7A6E6E] uppercase tracking-wider">Income Change (MoM)</span>
            <div className="text-2xl font-black text-[#1B1717] dark:text-[#EDEBDD] mt-1">
              {currency}{summary.totalIncome.toLocaleString()}
            </div>
            <span className="text-xs text-[#7A6E6E] font-medium">Vs last month ({currency}{mom.prevIncome.toLocaleString()})</span>
          </div>

          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-black text-xs ${
              mom.incomeMoM >= 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {mom.incomeMoM >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(mom.incomeMoM)}% MoM</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7A6E6E] uppercase tracking-wider">Expenses Change (MoM)</span>
            <div className="text-2xl font-black text-[#1B1717] dark:text-[#EDEBDD] mt-1">
              {currency}{summary.totalExpenses.toLocaleString()}
            </div>
            <span className="text-xs text-[#7A6E6E] font-medium">Vs last month ({currency}{mom.prevExpenses.toLocaleString()})</span>
          </div>

          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-black text-xs ${
              mom.expenseMoM <= 0
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {mom.expenseMoM >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(mom.expenseMoM)}% MoM</span>
          </div>
        </div>
      </div>

      {/* Savings Trend Area Chart */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-[#1B1717] dark:text-[#EDEBDD]">Savings & Net Flow Trend</h3>
          <p className="text-xs text-[#7A6E6E]">Track monthly capital retention over time</p>
        </div>

        <div className="h-64 w-full">
          {data?.monthlyTrend && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#810100" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#810100" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="savings" stroke="#810100" strokeWidth={3} fillOpacity={1} fill="url(#savingsGrad)" name="Net Savings" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Outflow & Top Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#1B1717] dark:text-[#EDEBDD]">Category Spending Distribution</h3>

          <div className="space-y-3">
            {data?.categoryBreakdown?.map((cat: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#4A3F3F] dark:text-[#C8BFB0]">{cat.name}</span>
                  <span className="text-[#1B1717] dark:text-[#EDEBDD]">
                    {currency}{cat.amount.toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#E6E1D3] dark:bg-[#382D2D] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: CHERRY_PALETTE[idx % CHERRY_PALETTE.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#1B1717] dark:text-[#EDEBDD]">Largest Outflow Entries</h3>

          <div className="divide-y divide-[#E6E1D3]/50 dark:divide-[#382D2D]">
            {data?.topExpenses?.map((tx: any) => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#1B1717] dark:text-[#EDEBDD]">{tx.description}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#7A6E6E]">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="font-black text-sm text-[#810100] dark:text-[#E53835]">
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
