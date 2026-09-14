"use client";
import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Logo({ href = "/dashboard", subtitle = "Personal Expense Tracker", size = "md", useImg = true }) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const sizeClasses = isSm ? "w-8 h-8 rounded-xl" : isLg ? "w-12 h-12 rounded-2xl" : "w-10 h-10 rounded-2xl";
  const textClasses = isSm ? "text-lg" : isLg ? "text-2xl" : "text-xl";

  return (
    <Link href={href} className="flex items-center gap-3 group shrink-0">
      {useImg ? (
        <img
          src="/logo.png"
          alt="FinTrack Logo"
          className={`${sizeClasses} object-cover shadow-md cherry-glow group-hover:scale-105 transition-transform duration-300 border border-white/10`}
        />
      ) : (
        <div className={`${sizeClasses} bg-gradient-to-br from-[#810100] via-[#A30100] to-[#630000] text-white flex items-center justify-center shadow-md cherry-glow group-hover:scale-105 transition-transform duration-300 border border-white/20`}>
          <TrendingUp className={`stroke-[2.5] ${isSm ? "w-4 h-4" : isLg ? "w-6 h-6" : "w-5 h-5"}`} />
        </div>
      )}
      <div className="flex flex-col">
        <span className={`font-black tracking-tight text-[#141010] dark:text-[#FAF8F5] leading-none ${textClasses}`}>
          FinTrack
        </span>
        {subtitle && (
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#810100] dark:text-[#E53835] mt-1">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
