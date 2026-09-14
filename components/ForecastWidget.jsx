"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

export function ForecastWidget({ currency = "₹" }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async () => {
    try {
      const res = await fetch("/api/ai/forecast");
      if (res.ok) {
        setForecast(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  if (loading || !forecast) {
    return (
      <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] animate-pulse text-xs text-[#594D4D]">
        Calculating AI spending velocity forecast...
      </div>
    );
  }

  const isRisk = forecast.isOverrunRisk;

  return (
    <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] text-white flex items-center justify-center shadow-md cherry-glow">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-[#141010] dark:text-[#FAF8F5]">AI Spending Velocity Forecast</h3>
            <span className="text-xs text-[#594D4D] dark:text-[#C8BFB0]">Day {forecast.currentDay} of {forecast.totalDaysInMonth}</span>
          </div>
        </div>

        <span
          className={`flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full border ${
            isRisk
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
          }`}
        >
          {isRisk ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
          <span>{isRisk ? "Overrun Risk" : "On Track"}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#594D4D]">Daily Velocity</span>
          <div className="text-xl font-black text-[#141010] dark:text-[#FAF8F5] mt-0.5 tabular-nums">
            {currency}{forecast.dailyVelocity} <span className="text-[11px] font-medium text-[#594D4D]">/ day</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#594D4D]">Projected Month-End Outflow</span>
          <div className="text-xl font-black text-[#810100] dark:text-[#E53835] mt-0.5 tabular-nums">
            {currency}{forecast.projectedTotalExpenses.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#594D4D]">Safe Daily Limit Left</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 tabular-nums">
            {currency}{forecast.safeDailySpendLimit} <span className="text-[11px] font-medium text-[#594D4D]">/ day</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#810100]/10 border border-[#810100]/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#810100] dark:text-[#E53835] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5]">AI Financial Recommendation</span>
          <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] font-medium leading-relaxed">
            {forecast.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
