"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Bot,
  PieChart as ChartIcon,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Play,
  Calendar,
  Users,
  MessageSquare,
  Camera,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Download,
  GraduationCap,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("pacing"); // "pacing" | "workspaces" | "ai" | "bot"
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How does FinTrack calculate my Safe Daily Spend limit?",
      a: "FinTrack takes your remaining monthly balance and active category budget limits, divides them by the days remaining in the month, and dynamically updates your daily safe spending cap so your allowance lasts comfortably until your next income.",
    },
    {
      q: "How do Multi-User Household Workspaces work?",
      a: "You can create shared workspaces for flatmates, room outings, or family bills. Share a 6-character Invite Code (e.g., FLAT-302) with roommates to manage shared expenses and track individual contributions seamlessly.",
    },
    {
      q: "How do I log transactions via WhatsApp Bot?",
      a: "FinTrack provides an automated bot webhook key. You can simply send text messages like 'Swiggy 240' or photo receipts to your WhatsApp bot, and FinTrack will automatically categorize and log it into your database.",
    },
    {
      q: "How does the AI Financial Advisor ensure number accuracy?",
      a: "Our AI model is grounded strictly in your real database transaction records, category caps, and spending history. It provides real-time financial analysis without generating ungrounded estimates or hallucinating figures.",
    },
    {
      q: "Can I export my complete financial dataset?",
      a: "Yes! FinTrack supports 100% data portability. You can export a full structured JSON backup of your transactions, categories, budgets, and goals anytime from your Profile & Settings page.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#141010] text-[#141010] dark:text-[#FAF8F5] selection:bg-[#810100] selection:text-[#FAF8F5] font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#810100]/25 via-[#630000]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] -right-40 w-[600px] h-[600px] bg-[#810100]/10 dark:bg-[#810100]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 h-20 border-b border-[#E2DBD0] dark:border-[#3B3030] backdrop-blur-xl bg-[#FAF8F5]/85 dark:bg-[#141010]/85 px-4 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="FinTrack Logo"
            className="w-10 h-10 rounded-2xl object-cover shadow-lg cherry-glow group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#141010] dark:text-[#FAF8F5]">
              FinTrack
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#810100] dark:text-[#E53835] -mt-1">
              Personal Expense Tracker
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold text-[#594D4D] dark:text-[#C8BFB0]">
          <a href="#showcase" className="hover:text-[#810100] dark:hover:text-[#FAF8F5] transition-colors">
            Product Showcase
          </a>
          <a href="#features" className="hover:text-[#810100] dark:hover:text-[#FAF8F5] transition-colors">
            Features
          </a>
          <a href="#preset" className="hover:text-[#810100] dark:hover:text-[#FAF8F5] transition-colors">
            Hostel Preset
          </a>
          <a href="#faq" className="hover:text-[#810100] dark:hover:text-[#FAF8F5] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-[#141010] dark:text-[#FAF8F5] bg-[#FFFFFF] dark:bg-[#201A1A] hover:bg-[#810100]/10 border border-[#E2DBD0] dark:border-[#3B3030] transition-colors shadow-xs"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#810100]" />}
          </button>

          <Link
            href={user ? "/dashboard" : "/login"}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] bg-[#FFFFFF] dark:bg-[#201A1A] hover:bg-[#810100]/10 border border-[#E2DBD0] dark:border-[#3B3030] transition-colors shadow-xs"
          >
            {user ? "Go to Dashboard" : "Sign In"}
          </Link>

          <Link
            href="/register"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-[#FAF8F5] shadow-md cherry-glow hover:opacity-95 transition-all"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-16 pb-16 px-4 lg:px-12 max-w-7xl mx-auto text-center space-y-8 relative">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-[#810100]/10 text-[#810100] dark:text-[#FAF8F5] border border-[#810100]/30 shadow-xs animate-in fade-in duration-300">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>New: Multi-User Household Workspaces & WhatsApp Assistant Bot</span>
        </div>

        {/* Hero Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-[#141010] dark:text-[#FAF8F5] max-w-5xl mx-auto">
          Master Your Daily Spending with{" "}
          <span className="bg-gradient-to-r from-[#810100] via-[#A30100] to-[#630000] dark:from-[#FAF8F5] dark:via-[#E2DBD0] dark:to-[#FAF8F5] bg-clip-text text-transparent">
            Smart Expense Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#594D4D] dark:text-[#C8BFB0] max-w-3xl mx-auto font-medium leading-relaxed">
          Log transactions instantly via WhatsApp bot, track Safe Daily Spend pacing, collaborate on household roommate bills, and get data-grounded AI advice.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#810100] to-[#630000] text-[#FAF8F5] shadow-xl cherry-glow flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FFFFFF] dark:bg-[#201A1A] text-[#141010] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] flex items-center justify-center gap-2 transition-all shadow-sm hover:bg-[#FAF8F5] dark:hover:bg-[#302929]"
          >
            <Play className="w-4 h-4 text-[#810100] dark:text-[#FAF8F5] fill-current" />
            <span>Explore Live Dashboard</span>
          </Link>
        </div>

        {/* Trust & Highlight Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-[#594D4D] dark:text-[#C8BFB0]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>100% Isolated Data</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#810100] dark:text-[#FAF8F5]" />
            <span>WhatsApp Assistant Bot</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span>₹6,000 Hostel Budget Preset</span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PRODUCT SHOWCASE SECTION */}
      <section id="showcase" className="py-12 px-4 lg:px-12 max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#810100] dark:text-[#FAF8F5]">
            Interactive Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#141010] dark:text-[#FAF8F5]">
            Explore FinTrack in Action
          </h2>
        </div>

        {/* Tab Pills Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl shadow-sm overflow-x-auto justify-start sm:justify-center">
          {[
            { id: "pacing", label: "Daily Pacing Engine", icon: Calendar },
            { id: "workspaces", label: "Household Workspaces", icon: Users },
            { id: "ai", label: "AI Advisor Intelligence", icon: Bot },
            { id: "bot", label: "WhatsApp Assistant Bot", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
                    : "text-[#594D4D] dark:text-[#C8BFB0] hover:text-[#141010] dark:hover:text-[#FAF8F5]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Mock Preview Box */}
        <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] p-6 shadow-2xl backdrop-blur-xl relative space-y-6 text-left">
          {/* Fake Window Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2DBD0] dark:border-[#3B3030]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="px-4 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] text-[11px] font-mono text-[#141010] dark:text-[#FAF8F5]">
              https://fintrack.app/{activeTab}
            </div>
            <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System Ready</span>
            </div>
          </div>

          {/* TAB 1: Daily Pacing Preview */}
          {activeTab === "pacing" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] text-[#FAF8F5] shadow-md cherry-glow">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">Net Reserve Balance</span>
                  <div className="text-2xl font-black mt-1">₹2,321</div>
                  <span className="text-[10px] opacity-80 font-medium">Safe spending capital</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
                  <span className="text-[11px] font-bold text-[#594D4D] uppercase">Total Income</span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹6,000</div>
                  <span className="text-[10px] text-[#594D4D] font-medium">Monthly allowance</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
                  <span className="text-[11px] font-bold text-[#594D4D] uppercase">Total Expenses</span>
                  <div className="text-2xl font-black text-[#810100] dark:text-[#E53835] mt-1">₹3,679</div>
                  <span className="text-[10px] text-[#594D4D] font-medium">Outflow logged</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
                  <span className="text-[11px] font-bold text-[#594D4D] uppercase">Safe Daily Spend Cap</span>
                  <div className="text-2xl font-black text-[#810100] dark:text-[#FAF8F5] mt-1">₹137 / day</div>
                  <span className="text-[10px] text-[#594D4D] font-medium">17 days remaining</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#810100]/10 border border-[#810100]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-[#810100] dark:text-[#FAF8F5] shrink-0" />
                  <span className="text-xs text-[#141010] dark:text-[#FAF8F5] font-semibold">
                    <strong>Pacing Guard:</strong> At current ₹137/day safe daily spend rate, your balance will last comfortably until 31st of this month.
                  </span>
                </div>
                <Link href="/dashboard" className="text-xs font-black text-[#810100] dark:text-[#FAF8F5] hover:underline shrink-0">
                  Open Dashboard ➔
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: Household Workspaces Preview */}
          {activeTab === "workspaces" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#810100] text-white flex items-center justify-center font-black">
                    H
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#141010] dark:text-[#FAF8F5]">Hostel Flat 302</h4>
                    <p className="text-xs text-[#594D4D]">Invite Code: <span className="font-mono font-bold text-[#810100] dark:text-[#FAF8F5]">FLAT-302</span> • 4 Active Flatmates</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Active Session
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] text-xs space-y-1">
                  <span className="font-bold text-[#594D4D] block">Shared Grocery Bill</span>
                  <span className="font-black text-sm text-[#810100] dark:text-[#FAF8F5]">₹1,200 Total</span>
                  <span className="text-[11px] text-emerald-600 font-semibold block">Your share: ₹300</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] text-xs space-y-1">
                  <span className="font-bold text-[#594D4D] block">Room WiFi Bill</span>
                  <span className="font-black text-sm text-[#810100] dark:text-[#FAF8F5]">₹799 Total</span>
                  <span className="text-[11px] text-emerald-600 font-semibold block">Your share: ₹200</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] text-xs space-y-1">
                  <span className="font-bold text-[#594D4D] block">Weekend Outing Pool</span>
                  <span className="font-black text-sm text-[#810100] dark:text-[#FAF8F5]">₹2,400 Total</span>
                  <span className="text-[11px] text-emerald-600 font-semibold block">Your share: ₹600</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI Advisor Preview */}
          {activeTab === "ai" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#810100] dark:text-[#FAF8F5]">
                  <Bot className="w-4 h-4" />
                  <span>Data-Grounded Intelligence Query:</span>
                </div>
                <p className="text-xs font-bold text-[#141010] dark:text-[#FAF8F5] bg-white dark:bg-[#201A1A] p-3 rounded-xl border border-[#E2DBD0] dark:border-[#3B3030]">
                  "Can I afford to buy new semester textbooks for ₹850 this week?"
                </p>
                <div className="p-3.5 rounded-xl bg-[#810100]/10 border border-[#810100]/25 text-xs text-[#141010] dark:text-[#FAF8F5] space-y-1">
                  <span className="font-black text-[#810100] dark:text-[#E53835] block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Advisor Recommendation:
                  </span>
                  <p className="font-medium text-[#594D4D] dark:text-[#C8BFB0]">
                    Yes! Your Education budget has ₹1,200 remaining out of your ₹1,500 monthly cap. Purchasing textbooks for ₹850 leaves you with ₹350 buffer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WhatsApp Assistant Bot Preview */}
          {activeTab === "bot" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <MessageSquare className="w-4 h-4" /> Instant WhatsApp Assistant Bot Logger
                  </span>
                  <span className="font-mono text-[10px] text-[#594D4D]">Webhook Active</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-600 text-white font-medium max-w-xs ml-auto shadow-xs">
                    Swiggy 240
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] font-semibold max-w-sm text-[#141010] dark:text-[#FAF8F5] shadow-xs">
                    🎉 Recorded! Logged ₹240 under <strong>Snacks & Mess Outings</strong> via UPI.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-16 px-4 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#810100] dark:text-[#FAF8F5]">
            Engineered for Total Financial Control
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#141010] dark:text-[#FAF8F5]">
            Full-Stack Personal Expense Tracker
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 shadow-sm hover:border-[#810100]/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#810100] text-white flex items-center justify-center font-bold cherry-glow">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#141010] dark:text-[#FAF8F5]">Safe Daily Spend Pacing</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] leading-relaxed font-medium">
              Dynamically calculates your safe daily allowance (`₹137/day`) based on remaining budget caps and active days in the month.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 shadow-sm hover:border-[#810100]/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#141010] dark:text-[#FAF8F5]">Household & Roommate Workspaces</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] leading-relaxed font-medium">
              Create multi-user flat accounts, split room bills, share 6-character invite codes, and manage room outing pools.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 shadow-sm hover:border-[#810100]/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#630000] text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#141010] dark:text-[#FAF8F5]">WhatsApp Assistant Bot</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] leading-relaxed font-medium">
              Log transactions on the fly directly inside WhatsApp. Text simple prompts or photo receipts for instant logging.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 shadow-sm hover:border-[#810100]/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#141010] dark:text-[#FAF8F5]">OCR Receipt Vision & Voice Log</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] leading-relaxed font-medium">
              Auto-scan UPI payment screenshots and physical bill receipts, or log transactions hands-free using voice input.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 shadow-sm hover:border-[#810100]/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#810100] text-white flex items-center justify-center font-bold cherry-glow">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#141010] dark:text-[#FAF8F5]">Data-Grounded AI Advisor</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] leading-relaxed font-medium">
              Ask financial questions grounded strictly in your real database transactions without hallucinations or guesswork.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 shadow-sm hover:border-[#810100]/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#141010] dark:text-[#FAF8F5]">4-Digit App Lock & JSON Export</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] leading-relaxed font-medium">
              Protect your spending privacy with a 4-digit PIN security overlay, and export complete structured JSON backups anytime.
            </p>
          </div>
        </div>
      </section>

      {/* HOSTEL PRESET SPOTLIGHT SECTION */}
      <section id="preset" className="py-12 px-4 lg:px-12 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#FFFFFF] via-[#FAF8F5] to-[#F5EFE6] dark:from-[#201A1A] dark:via-[#1A1414] dark:to-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30">
              <GraduationCap className="w-4 h-4" />
              <span>Tailored for Hostel Students & Roommates</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-[#141010] dark:text-[#FAF8F5]">
              Hostel Student ₹6,000 Budget Template
            </h3>
            <p className="text-xs sm:text-sm text-[#594D4D] dark:text-[#C8BFB0] font-medium leading-relaxed">
              Pre-configured category caps for snacks & mess outings (`₹1,500`), transport (`₹800`), mobile data (`₹300`), toiletries, education, and emergency savings reserve.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black bg-[#810100] text-white shadow-md cherry-glow hover:opacity-95 transition-all"
              >
                <span>Load ₹6,000 Preset Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] shadow-md space-y-3 text-left">
            <span className="text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5] block border-b border-[#E2DBD0] dark:border-[#3B3030] pb-2">
              Preset Budget Allocation
            </span>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-[#594D4D]">Snacks & Mess</span>
                <span className="text-[#810100] dark:text-[#FAF8F5]">₹1,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#594D4D]">Transport</span>
                <span className="text-[#810100] dark:text-[#FAF8F5]">₹800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#594D4D]">Emergency Reserve</span>
                <span className="text-emerald-600">₹800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#594D4D]">Shopping & Books</span>
                <span className="text-[#810100] dark:text-[#FAF8F5]">₹1,500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS & SOCIAL PROOF */}
      <section className="py-12 px-4 lg:px-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-xs space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#810100] dark:text-[#FAF8F5]">40 / 40</div>
            <span className="text-[11px] font-bold text-[#594D4D] uppercase">Verified App Routes</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-xs space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
            <span className="text-[11px] font-bold text-[#594D4D] uppercase">Data Privacy</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-xs space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#810100] dark:text-[#FAF8F5]">&lt; 3s</div>
            <span className="text-[11px] font-bold text-[#594D4D] uppercase">AI Response Speed</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-xs space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500">₹6,000</div>
            <span className="text-[11px] font-bold text-[#594D4D] uppercase">Hostel Preset Ready</span>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 px-4 lg:px-12 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#810100] dark:text-[#FAF8F5]">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-[#141010] dark:text-[#FAF8F5]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-[#141010] dark:text-[#FAF8F5]"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#810100] dark:text-[#FAF8F5] transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs font-medium text-[#594D4D] dark:text-[#C8BFB0] border-t border-[#E2DBD0]/40 dark:border-[#3B3030]/40 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FLOATING CTA BANNER */}
      <section className="py-16 px-4 lg:px-12 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#810100] to-[#630000] text-white text-center space-y-6 shadow-2xl cherry-glow relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto">
            Ready to Take Control of Your Daily Spending?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto font-medium leading-relaxed">
            Join FinTrack today. Set category budgets, automate expense logging via WhatsApp, and track your safe daily spend allowance.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-white text-[#810100] shadow-xl hover:bg-[#FAF8F5] transition-all transform hover:scale-105"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-[#E2DBD0] dark:border-[#3B3030] px-4 lg:px-12 text-center text-xs text-[#594D4D] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#810100] text-[#FAF8F5] flex items-center justify-center font-black text-xs">
            F
          </div>
          <span className="font-extrabold text-[#141010] dark:text-[#FAF8F5]">
            FinTrack • Personal Expense Tracker
          </span>
        </div>

        <div className="flex items-center gap-4 font-bold text-[#594D4D] dark:text-[#C8BFB0]">
          <Link href="/login" className="hover:underline">
            Sign In
          </Link>
          <Link href="/register" className="hover:underline font-extrabold text-[#810100] dark:text-[#FAF8F5]">
            Create Account
          </Link>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
