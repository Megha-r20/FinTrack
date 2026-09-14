"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Bot,
  ShieldCheck,
  PieChart as ChartIcon,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Play,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Search,
  Download,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the Hostel Student ₹6,000 Budget Template work?",
      a: "FinTrack provides a 1-click preset that auto-allocates realistic monthly caps for non-mess expenses: Snacks & Outings (₹1,500), Transport (₹800), Mobile Recharge (₹300), Personal Care (₹500), Entertainment (₹600), Books (₹500), Emergency (₹800), and Shopping (₹1,000). Every limit remains 100% customizable.",
    },
    {
      q: "How are Safe Daily and Weekly Spending allowances calculated?",
      a: "FinTrack continuously computes `(Total Remaining Budget) / (Days Remaining in Month)` to give you a dynamic daily spend limit (e.g. ₹137/day). If you overspend on snacks, the daily cap automatically adjusts so you never run out of money before month-end.",
    },
    {
      q: "Does the AI Advisor invent or guess financial numbers?",
      a: "Never! FinTrack AI strictly aggregates real calculated metrics from your recorded transactions and budget capacities. It provides educational data insights tailored to student lifestyle needs without number hallucinations.",
    },
    {
      q: "Can I export my financial data?",
      a: "Yes! You can export a full structured JSON backup of your transactions, categories, and budgets anytime from the Profile & Settings page with a single click.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#141010] text-[#141010] dark:text-[#FAF8F5] selection:bg-[#810100] selection:text-[#FAF8F5] font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#810100]/20 via-[#630000]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 h-20 border-b border-[#E2DBD0] dark:border-[#3B3030] backdrop-blur-xl bg-[#FAF8F5]/85 dark:bg-[#141010]/85 px-4 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] flex items-center justify-center text-[#FAF8F5] shadow-lg cherry-glow">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#141010] dark:text-[#FAF8F5]">
              FinTrack
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#810100] dark:text-[#E53835] -mt-1">
              Hostel Edition • Luxury SaaS
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#594D4D] dark:text-[#C8BFB0]">
          <a href="#features" className="hover:text-[#810100] dark:hover:text-[#FAF8F5] transition-colors">Student Features</a>
          <a href="#pacing" className="hover:text-[#810100] dark:hover:text-[#FAF8F5] transition-colors">Safe Pacing</a>
          <a href="#palette" className="hover:text-[#810100] dark:hover:text-[#FAF8F5] transition-colors">Aesthetic Theme</a>
          <a href="#faq" className="hover:text-[#810100] dark:hover:text-[#FAF8F5] transition-colors">FAQ</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-[#141010] dark:text-[#FAF8F5] bg-[#FFFFFF] dark:bg-[#201A1A] hover:bg-[#810100]/10 border border-[#E2DBD0] dark:border-[#3B3030] transition-colors shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#810100]" />}
          </button>

          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#810100] to-[#630000] text-[#FAF8F5] shadow-md cherry-glow transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] bg-[#FFFFFF] dark:bg-[#201A1A] hover:bg-[#810100]/10 border border-[#E2DBD0] dark:border-[#3B3030] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#810100] to-[#630000] text-[#FAF8F5] shadow-md cherry-glow transition-all"
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#810100]/10 text-[#810100] dark:text-[#FAF8F5] border border-[#810100]/30 shadow-sm">
          <GraduationCap className="w-4 h-4 text-[#810100] dark:text-[#E53835]" />
          <span>Hostel Student Edition • Safe &lt; ₹6,000/mo Pacing</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-[#141010] dark:text-[#FAF8F5] max-w-4xl mx-auto">
          Smart Hostel Budgeting &{" "}
          <span className="bg-gradient-to-r from-[#810100] via-[#630000] to-[#810100] dark:from-[#FAF8F5] dark:via-[#C8BFB0] dark:to-[#FAF8F5] bg-clip-text text-transparent">
            Safe Daily Spend
          </span>{" "}
          Pacing
        </h1>

        <p className="text-base md:text-lg text-[#594D4D] dark:text-[#C8BFB0] max-w-2xl mx-auto font-medium leading-relaxed">
          Tailored for college hostel residents. Track mess snacks, transport, data recharges, and personal care. Know your exact safe daily spend cap so your ₹6,000 allowance lasts all month.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#810100] to-[#630000] text-[#FAF8F5] shadow-xl cherry-glow flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Free Student Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FFFFFF] dark:bg-[#201A1A] text-[#141010] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Play className="w-4 h-4 text-[#810100] dark:text-[#FAF8F5] fill-current" />
            <span>Launch Live Demo (Megha R)</span>
          </Link>
        </div>

        {/* Interactive Live Preview Showcase */}
        <div id="pacing" className="pt-10 max-w-5xl mx-auto">
          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] p-4 md:p-6 shadow-2xl backdrop-blur-xl relative text-left space-y-6">
            {/* Fake Window Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2DBD0] dark:border-[#3B3030]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#810100]" />
                <div className="w-3 h-3 rounded-full bg-[#630000]" />
                <div className="w-3 h-3 rounded-full bg-[#FAF8F5] border border-[#3B3030]" />
              </div>
              <div className="px-4 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] text-[11px] font-mono text-[#141010] dark:text-[#FAF8F5]">
                https://fintrack.app/dashboard
              </div>
              <div className="text-xs font-extrabold text-[#810100] dark:text-[#FAF8F5] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hostel ₹6,000 Live Engine</span>
              </div>
            </div>

            {/* Simulated Student Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#810100] to-[#630000] text-[#FAF8F5] shadow-md cherry-glow">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FAF8F5]/80">Net Balance</span>
                <div className="text-2xl font-black mt-1">₹2,321</div>
                <span className="text-[10px] text-white/80 font-medium">Reserve balance</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
                <span className="text-[11px] font-bold text-[#594D4D] uppercase">Hostel Allowance</span>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹6,000</div>
                <span className="text-[10px] text-[#594D4D] font-medium">Monthly credit from home</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
                <span className="text-[11px] font-bold text-[#594D4D] uppercase">Hostel Outflow</span>
                <div className="text-2xl font-black text-[#810100] dark:text-[#E53835] mt-1">₹3,679</div>
                <span className="text-[10px] text-[#594D4D] font-medium">Snacks, travel, recharges</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
                <span className="text-[11px] font-bold text-[#594D4D] uppercase">Safe Daily Spend</span>
                <div className="text-2xl font-black text-[#810100] dark:text-[#FAF8F5] mt-1">₹137 / day</div>
                <span className="text-[10px] text-[#594D4D] font-medium">17 days remaining</span>
              </div>
            </div>

            {/* Simulated Pacing Advice Card */}
            <div className="p-4 rounded-2xl bg-[#810100]/10 border border-[#810100]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-[#810100] dark:text-[#FAF8F5] shrink-0" />
                <span className="text-xs text-[#141010] dark:text-[#FAF8F5] font-semibold">
                  <strong>Student Pacing Tip:</strong> You have ₹2,321 left. Stick to a max of ₹137/day for canteen tea, snacks, and auto rides.
                </span>
              </div>
              <Link href="/login" className="text-xs font-extrabold text-[#810100] dark:text-[#FAF8F5] hover:underline shrink-0">
                Explore Demo ➔
              </Link>
            </div>
          </div>
        </div>

        {/* Aesthetic Palette Swatches */}
        <div id="palette" className="pt-8 max-w-3xl mx-auto">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#141010] dark:text-[#FAF8F5]">FinTrack Luxury Theme Engine</h3>
              <span className="text-[11px] font-bold text-[#810100] dark:text-[#FAF8F5] uppercase tracking-wider">Ivory Cream & Cherry Noir</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Swatch 1 */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] text-[#141010] border border-[#E2DBD0] space-y-1 shadow-sm">
                <span className="font-black text-xs block">IVORY CREAM</span>
                <span className="text-[10px] font-mono text-[#594D4D] block">#FAF8F5</span>
                <span className="text-[9px] text-[#594D4D] block">Warm Light Mode</span>
              </div>

              {/* Swatch 2 */}
              <div className="p-3.5 rounded-2xl bg-[#810100] text-[#FAF8F5] border border-[#630000] space-y-1 shadow-sm">
                <span className="font-black text-xs block">CHERRY RED</span>
                <span className="text-[10px] font-mono text-[#FAF8F5]/80 block">#810100</span>
                <span className="text-[9px] text-[#FAF8F5]/70 block">Rich Crimson Glow</span>
              </div>

              {/* Swatch 3 */}
              <div className="p-3.5 rounded-2xl bg-[#630000] text-[#FAF8F5] border border-[#4A0000] space-y-1 shadow-sm">
                <span className="font-black text-xs block">MAROON</span>
                <span className="text-[10px] font-mono text-[#FAF8F5]/80 block">#630000</span>
                <span className="text-[9px] text-[#FAF8F5]/70 block">Velvet Accent</span>
              </div>

              {/* Swatch 4 */}
              <div className="p-3.5 rounded-2xl bg-[#141010] text-[#FAF8F5] border border-[#3B3030] space-y-1 shadow-sm">
                <span className="font-black text-xs block">NOIR DARK</span>
                <span className="text-[10px] font-mono text-[#C8BFB0] block">#141010</span>
                <span className="text-[9px] text-[#594D4D] block">Sleek Modern Dark</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Features Section */}
      <section id="features" className="py-16 px-4 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#810100] dark:text-[#FAF8F5]">Engineered for Hostel Life</span>
          <h2 className="text-3xl md:text-5xl font-black text-[#141010] dark:text-[#FAF8F5]">Comprehensive Student Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#810100] text-[#FAF8F5] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#141010] dark:text-[#FAF8F5]">Safe Daily Spending Limit</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] leading-relaxed">
              Dynamically calculates how much cash you can safely spend each day (`₹137/day`) so your monthly pocket allowance lasts until the next credit.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#630000] text-[#FAF8F5] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-extrabold text-lg text-[#141010] dark:text-[#FAF8F5]">Hostel ₹6,000 Preset Template</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] leading-relaxed">
              1-click setup for mess snacks (₹1,500), transport (₹800), data recharge (₹300), toiletries (₹500), books (₹500), and savings.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#810100] text-[#FAF8F5] flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-[#141010] dark:text-[#FAF8F5]">Student-Aware AI Advisor</h3>
            <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] leading-relaxed">
              Asks practical questions like *"Am I spending too much on snacks?"* and gives grounded advice without hallucinating numbers.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 lg:px-12 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#810100] dark:text-[#FAF8F5]">Got Questions?</span>
          <h2 className="text-3xl font-black text-[#141010] dark:text-[#FAF8F5]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between font-bold text-xs md:text-sm text-[#141010] dark:text-[#FAF8F5]"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#810100] transition-transform duration-200 ${
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

      {/* Footer */}
      <footer className="py-8 border-t border-[#E2DBD0] dark:border-[#3B3030] px-4 lg:px-12 text-center text-xs text-[#594D4D] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#810100] text-[#FAF8F5] flex items-center justify-center font-black text-xs">
            F
          </div>
          <span className="font-extrabold text-[#141010] dark:text-[#FAF8F5]">FinTrack • Hostel Student Edition</span>
        </div>

        <div className="flex items-center gap-4 font-bold">
          <Link href="/login" className="hover:underline">Sign In</Link>
          <Link href="/register" className="hover:underline font-extrabold text-[#810100]">Create Free Account</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
