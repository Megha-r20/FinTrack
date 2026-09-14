"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Bot,
  ShieldCheck,
  PieChart as ChartIcon,
  Target,
  Repeat,
  Download,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  BarChart3,
  Play,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai" | "budgets" | "analytics">("dashboard");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the AI Financial Advisor analyze my data?",
      a: "FinTrack AI securely aggregates your anonymized monthly transaction totals, budget limits, and savings goals on the server side. It synthesizes grounded analytical observations regarding spending spikes, category trends, and potential subscription savings.",
    },
    {
      q: "Does FinTrack connect to real bank accounts or make money transfers?",
      a: "No. For maximum safety and regulatory compliance, FinTrack is a zero-risk personal finance intelligence platform. It does not perform real-money bank transfers or brokerage trading.",
    },
    {
      q: "Can I import past transaction records from Excel or another app?",
      a: "Yes! FinTrack includes a client-side CSV parser powered by PapaParse. You can upload any multi-row CSV file, inspect row-level validation warnings, and batch import records instantly.",
    },
    {
      q: "Is dark mode supported in this luxury theme?",
      a: "Yes! FinTrack comes built-in with Cotton Cream light mode and Noir Black & Cherry Red dark mode, tailored with exact color swatches (#EDEBDD, #810100, #630000, #1B1717).",
    },
  ];

  return (
    <div className="min-h-screen bg-[#EDEBDD] dark:bg-[#1B1717] text-[#1B1717] dark:text-[#EDEBDD] selection:bg-[#810100] selection:text-[#EDEBDD] font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#810100]/20 via-[#630000]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 h-20 border-b border-[#DCD7C5] dark:border-[#382D2D] backdrop-blur-xl bg-[#EDEBDD]/85 dark:bg-[#1B1717]/85 px-4 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] flex items-center justify-center text-[#EDEBDD] shadow-lg cherry-glow">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#1B1717] dark:text-[#EDEBDD]">
              FinTrack
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#810100] dark:text-[#E53835] -mt-1">
              Cotton & Cherry Noir
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#544A4A] dark:text-[#C8BFB0]">
          <a href="#features" className="hover:text-[#810100] dark:hover:text-[#EDEBDD] transition-colors">Features</a>
          <a href="#palette" className="hover:text-[#810100] dark:hover:text-[#EDEBDD] transition-colors">Color Palette</a>
          <a href="#preview" className="hover:text-[#810100] dark:hover:text-[#EDEBDD] transition-colors">Platform Demo</a>
          <a href="#faq" className="hover:text-[#810100] dark:hover:text-[#EDEBDD] transition-colors">FAQ</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-[#1B1717] dark:text-[#EDEBDD] bg-[#FAF8F2] dark:bg-[#252020] hover:bg-[#810100]/10 border border-[#DCD7C5] dark:border-[#382D2D] transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#810100]" />}
          </button>

          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#810100] to-[#630000] text-[#EDEBDD] shadow-md cherry-glow transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#1B1717] dark:text-[#EDEBDD] bg-[#FAF8F2] dark:bg-[#252020] hover:bg-[#810100]/10 border border-[#DCD7C5] dark:border-[#382D2D] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#810100] to-[#630000] text-[#EDEBDD] shadow-md cherry-glow transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 lg:px-12 max-w-7xl mx-auto text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#810100]/10 text-[#810100] dark:text-[#EDEBDD] border border-[#810100]/30">
          <Sparkles className="w-4 h-4 text-[#810100] dark:text-[#E53835]" />
          <span>Cherry Noir Luxury Edition • Designed for Megha R</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-[#1B1717] dark:text-[#EDEBDD] max-w-4xl mx-auto">
          Master Wealth in{" "}
          <span className="bg-gradient-to-r from-[#810100] via-[#630000] to-[#810100] dark:from-[#EDEBDD] dark:via-[#C8BFB0] dark:to-[#EDEBDD] bg-clip-text text-transparent">
            Cherry & Cotton
          </span>{" "}
          Elegance
        </h1>

        <p className="text-base md:text-lg text-[#544A4A] dark:text-[#C8BFB0] max-w-2xl mx-auto font-medium leading-relaxed">
          Track expenses, set category budgets, visualize cash flow trends, and consult your personal AI Financial Advisor in a bespoke aesthetic theme.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#810100] to-[#630000] text-[#EDEBDD] shadow-xl cherry-glow flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FAF8F2] dark:bg-[#252020] text-[#1B1717] dark:text-[#EDEBDD] border border-[#DCD7C5] dark:border-[#382D2D] flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 text-[#810100] dark:text-[#EDEBDD] fill-current" />
            <span>Launch Live Demo Account</span>
          </Link>
        </div>

        {/* Color Palette Swatch Card Section */}
        <div id="palette" className="pt-8 max-w-3xl mx-auto">
          <div className="p-6 rounded-3xl bg-[#FAF8F2] dark:bg-[#252020] border border-[#DCD7C5] dark:border-[#382D2D] shadow-xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#1B1717] dark:text-[#EDEBDD]">FinTrack Luxury Color Palette</h3>
              <span className="text-[11px] font-bold text-[#810100] dark:text-[#EDEBDD] uppercase tracking-wider">Aesthetic Theme Swatches</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Swatch 1: Cotton */}
              <div className="p-3.5 rounded-2xl bg-[#EDEBDD] text-[#1B1717] border border-[#DCD7C5] space-y-1 shadow-sm">
                <span className="font-black text-xs block">COTTON</span>
                <span className="text-[10px] font-mono text-[#544A4A] block">#EDEBDD</span>
                <span className="text-[9px] text-[#887B7B] block">Cream Ivory Base</span>
              </div>

              {/* Swatch 2: Cherry Red */}
              <div className="p-3.5 rounded-2xl bg-[#810100] text-[#EDEBDD] border border-[#630000] space-y-1 shadow-sm">
                <span className="font-black text-xs block">CHERRY RED</span>
                <span className="text-[10px] font-mono text-[#EDEBDD]/80 block">#810100</span>
                <span className="text-[9px] text-[#EDEBDD]/70 block">Rich Vibrant Crimson</span>
              </div>

              {/* Swatch 3: Maroon */}
              <div className="p-3.5 rounded-2xl bg-[#630000] text-[#EDEBDD] border border-[#4A0000] space-y-1 shadow-sm">
                <span className="font-black text-xs block">MAROON</span>
                <span className="text-[10px] font-mono text-[#EDEBDD]/80 block">#630000</span>
                <span className="text-[9px] text-[#EDEBDD]/70 block">Deep Velvet Accent</span>
              </div>

              {/* Swatch 4: Noir Black */}
              <div className="p-3.5 rounded-2xl bg-[#1B1717] text-[#EDEBDD] border border-[#382D2D] space-y-1 shadow-sm">
                <span className="font-black text-xs block">NOIR BLACK</span>
                <span className="text-[10px] font-mono text-[#C8BFB0] block">#1B1717</span>
                <span className="text-[9px] text-[#8C8080] block">Sleek Warm Dark</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Demo Showcase */}
        <div id="preview" className="pt-10 max-w-5xl mx-auto">
          <div className="rounded-3xl bg-[#FAF8F2] dark:bg-[#252020] border border-[#DCD7C5] dark:border-[#382D2D] p-4 md:p-6 shadow-2xl backdrop-blur-xl relative text-left">
            {/* Fake Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#DCD7C5] dark:border-[#382D2D] mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#810100]" />
                <div className="w-3 h-3 rounded-full bg-[#630000]" />
                <div className="w-3 h-3 rounded-full bg-[#EDEBDD] border border-[#382D2D]" />
              </div>
              <div className="px-4 py-1 rounded-full bg-[#EDEBDD] dark:bg-[#1B1717] border border-[#DCD7C5] dark:border-[#382D2D] text-[11px] font-mono text-[#1B1717] dark:text-[#EDEBDD]">
                https://fintrack.app/dashboard
              </div>
              <div className="text-xs font-extrabold text-[#810100] dark:text-[#EDEBDD] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#810100] dark:bg-[#EDEBDD] animate-pulse" />
                <span>Megha R Edition</span>
              </div>
            </div>

            {/* Simulated Live Preview Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] text-[#EDEBDD] shadow-md cherry-glow">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#EDEBDD]/80">Total Balance</span>
                <div className="text-2xl font-black mt-1">₹1,45,200</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#EDEBDD] dark:bg-[#1B1717] border border-[#DCD7C5] dark:border-[#382D2D]">
                <span className="text-[11px] font-bold text-[#544A4A] dark:text-[#C8BFB0] uppercase">Monthly Income</span>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹95,000</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#EDEBDD] dark:bg-[#1B1717] border border-[#DCD7C5] dark:border-[#382D2D]">
                <span className="text-[11px] font-bold text-[#544A4A] dark:text-[#C8BFB0] uppercase">Monthly Expenses</span>
                <div className="text-2xl font-black text-[#810100] dark:text-[#E53835] mt-1">₹42,850</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#EDEBDD] dark:bg-[#1B1717] border border-[#DCD7C5] dark:border-[#382D2D]">
                <span className="text-[11px] font-bold text-[#544A4A] dark:text-[#C8BFB0] uppercase">Savings Rate</span>
                <div className="text-2xl font-black text-[#1B1717] dark:text-[#EDEBDD] mt-1">54.8%</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#810100]/10 border border-[#810100]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-[#810100] dark:text-[#EDEBDD]" />
                <span className="text-xs text-[#1B1717] dark:text-[#EDEBDD] font-medium">
                  <strong>AI Advisor Insight for Megha R:</strong> Your food spending increased 18% compared to last month. Savings rate remains strong at 54.8%.
                </span>
              </div>
              <Link href="/login" className="text-xs font-extrabold text-[#810100] dark:text-[#EDEBDD] hover:underline">
                Ask AI ➔
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#810100] dark:text-[#EDEBDD]">Aesthetic & Engineered</span>
          <h2 className="text-3xl md:text-5xl font-black text-[#1B1717] dark:text-[#EDEBDD]">Full-Stack Wealth Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#FAF8F2] dark:bg-[#252020] border border-[#DCD7C5] dark:border-[#382D2D] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#810100] text-[#EDEBDD] flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#1B1717] dark:text-[#EDEBDD]">AI Advisor & Chat</h3>
            <p className="text-xs text-[#544A4A] dark:text-[#C8BFB0] leading-relaxed">
              Ask questions about spending patterns, highest categories, or budget overruns grounded in your actual database entries.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAF8F2] dark:bg-[#252020] border border-[#DCD7C5] dark:border-[#382D2D] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#630000] text-[#EDEBDD] flex items-center justify-center font-bold">
              <ChartIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#1B1717] dark:text-[#EDEBDD]">Smart Category Limits</h3>
            <p className="text-xs text-[#544A4A] dark:text-[#C8BFB0] leading-relaxed">
              Define monthly caps for Food, Rent, Bills, and Subscriptions. Receive alerts when approaching (&gt;80%) or exceeding limits.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAF8F2] dark:bg-[#252020] border border-[#DCD7C5] dark:border-[#382D2D] space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#810100] text-[#EDEBDD] flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#1B1717] dark:text-[#EDEBDD]">Financial Goal Reserves</h3>
            <p className="text-xs text-[#544A4A] dark:text-[#C8BFB0] leading-relaxed">
              Set target goals (Emergency Funds, Gadgets, Vacations) and log progress deposit contributions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#DCD7C5] dark:border-[#382D2D] px-4 lg:px-12 text-center text-xs text-[#887B7B] dark:text-[#8C8080] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#810100] text-[#EDEBDD] flex items-center justify-center font-black text-xs">
            F
          </div>
          <span className="font-extrabold text-[#1B1717] dark:text-[#EDEBDD]">FinTrack • Megha R Edition</span>
        </div>

        <div className="flex items-center gap-4 font-bold">
          <Link href="/login" className="hover:underline">Sign In</Link>
          <Link href="/register" className="hover:underline">Register</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
