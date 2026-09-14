"use client";
import React, { useState, useEffect } from "react";
import { Flame, Trophy, Award, ShieldCheck } from "lucide-react";

export function GamificationWidget() {
  const [data, setData] = useState({ currentStreak: 0, bestStreak: 0, badges: [] });
  const [loading, setLoading] = useState(true);

  const fetchGamification = async () => {
    try {
      const res = await fetch("/api/gamification");
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
    fetchGamification();
  }, []);

  if (loading) return null;

  return (
    <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6 fill-current animate-bounce" />
          </div>
          <div>
            <h3 className="font-black text-base text-[#141010] dark:text-[#FAF8F5]">
              {data.currentStreak}-Day Budget Streak 🔥
            </h3>
            <span className="text-xs text-[#594D4D] dark:text-[#C8BFB0]">Best Streak: {data.bestStreak} Days</span>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          On Track Today
        </span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {data.badges.map((b) => (
          <div
            key={b.badgeId}
            className={`p-3 rounded-2xl border text-center space-y-1.5 transition-all ${
              b.isUnlocked
                ? "bg-[#FAF8F5] dark:bg-[#141010] border-amber-500/50 shadow-sm"
                : "bg-[#FAF8F5]/40 dark:bg-[#141010]/40 border-[#E2DBD0] dark:border-[#3B3030] opacity-50"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
              {b.icon === "Flame" ? (
                <Flame className="w-4 h-4" />
              ) : b.icon === "ShieldCheck" ? (
                <ShieldCheck className="w-4 h-4" />
              ) : b.icon === "Award" ? (
                <Award className="w-4 h-4" />
              ) : (
                <Trophy className="w-4 h-4" />
              )}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-[#141010] dark:text-[#FAF8F5] truncate">{b.title}</h4>
              <p className="text-[10px] text-[#594D4D] line-clamp-2 leading-tight">{b.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
