"use client";
import React, { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
export default function AnalyticsPage() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const currency = user?.currency || "₹";
    const [period, setPeriod] = useState("THIS_MONTH");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics?period=${period}`);
            if (res.ok) {
                setData(await res.json());
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
        fetchAnalytics();
    }, [period]);
    const summary = data?.summary || { totalIncome: 0, totalExpenses: 0, netSavings: 0, savingsRate: 0 };
    const mom = data?.momComparison || { incomeMoM: 0, expenseMoM: 0, prevIncome: 0, prevExpenses: 0 };
    const CHERRY_PALETTE = ["#810100", "#630000", "#9E100E", "#B22222", "#4A0000", "#D32F2F", "#8B0000"];
    return (<div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#141010] dark:text-[#FAF8F5]">
            Financial Analytics & MoM Trends
          </h1>
          <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
            Deep-dive visual breakdown of cash flow trends and month-over-month shifts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl shadow-sm">
          {[
            { id: "THIS_MONTH", label: "This Month" },
            { id: "LAST_MONTH", label: "Last Month" },
            { id: "LAST_3_MONTHS", label: "Last 3M" },
            { id: "THIS_YEAR", label: "This Year" },
        ].map((item) => (<button key={item.id} onClick={() => setPeriod(item.id)} className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${period === item.id
                ? "bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
                : "text-[#4A3F3F] dark:text-[#C8BFB0] hover:text-[#141010] dark:hover:text-[#FAF8F5]"}`}>
              {item.label}
            </button>))}
        </div>
      </div>

      {/* MoM Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#594D4D] uppercase tracking-wider">Income Change (MoM)</span>
            <div className="text-2xl font-black text-[#141010] dark:text-[#FAF8F5] mt-1">
              {currency}{summary.totalIncome.toLocaleString()}
            </div>
            <span className="text-xs text-[#594D4D] font-medium">Vs last month ({currency}{mom.prevIncome.toLocaleString()})</span>
          </div>

          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-black text-xs ${mom.incomeMoM >= 0
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            : "bg-rose-500/15 text-rose-600 dark:text-rose-400"}`}>
            {mom.incomeMoM >= 0 ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
            <span>{Math.abs(mom.incomeMoM)}% MoM</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#594D4D] uppercase tracking-wider">Expenses Change (MoM)</span>
            <div className="text-2xl font-black text-[#141010] dark:text-[#FAF8F5] mt-1">
              {currency}{summary.totalExpenses.toLocaleString()}
            </div>
            <span className="text-xs text-[#594D4D] font-medium">Vs last month ({currency}{mom.prevExpenses.toLocaleString()})</span>
          </div>

          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-black text-xs ${mom.expenseMoM <= 0
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            : "bg-rose-500/15 text-rose-600 dark:text-rose-400"}`}>
            {mom.expenseMoM >= 0 ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
            <span>{Math.abs(mom.expenseMoM)}% MoM</span>
          </div>
        </div>
      </div>

      {/* Savings Trend Area Chart */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-[#141010] dark:text-[#FAF8F5]">Savings & Net Flow Trend</h3>
          <p className="text-xs text-[#594D4D]">Track monthly capital retention over time</p>
        </div>

        <div className="h-64 w-full">
          {data?.monthlyTrend && (<ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#810100" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#810100" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke={theme === "dark" ? "#887B7B" : "#594D4D"} fontSize={11}/>
                <YAxis stroke={theme === "dark" ? "#887B7B" : "#594D4D"} fontSize={11}/>
                <Tooltip contentStyle={{
                backgroundColor: theme === "dark" ? "#141010" : "#FFFFFF",
                borderColor: theme === "dark" ? "#3B3030" : "#E2DBD0",
                borderRadius: "14px",
                color: theme === "dark" ? "#FAF8F5" : "#141010",
                fontSize: "12px",
            }}/>
                <Area type="monotone" dataKey="savings" stroke="#810100" strokeWidth={3} fillOpacity={1} fill="url(#savingsGrad)" name="Net Savings"/>
              </AreaChart>
            </ResponsiveContainer>)}
        </div>
      </div>

      {/* Category Outflow & Top Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#141010] dark:text-[#FAF8F5]">Category Spending Distribution</h3>

          <div className="space-y-3">
            {data?.categoryBreakdown?.map((cat, idx) => (<div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#4A3F3F] dark:text-[#C8BFB0]">{cat.name}</span>
                  <span className="text-[#141010] dark:text-[#FAF8F5]">
                    {currency}{cat.amount.toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-[#E2DBD0] dark:bg-[#3B3030] h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${cat.percentage}%`,
                backgroundColor: CHERRY_PALETTE[idx % CHERRY_PALETTE.length],
            }}/>
                </div>
              </div>))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#141010] dark:text-[#FAF8F5]">Largest Outflow Entries</h3>

          <div className="divide-y divide-[#E2DBD0]/50 dark:divide-[#3B3030]">
            {data?.topExpenses?.map((tx) => (<div key={tx.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#141010] dark:text-[#FAF8F5]">{tx.description}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#594D4D]">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="font-black text-sm text-[#810100] dark:text-[#E53835]">
                  -{currency}{tx.amount.toLocaleString()}
                </span>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}
