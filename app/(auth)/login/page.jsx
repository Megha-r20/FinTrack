"use client";
import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password)
            return;
        setSubmitting(true);
        try {
            await login(email, password);
            showToast("Welcome back to FinTrack!", "success");
        }
        catch (err) {
            showToast(err.message || "Invalid credentials", "error");
        }
        finally {
            setSubmitting(false);
        }
    };
    const fillDemoAccount = () => {
        setEmail("demo@fintrack.com");
        setPassword("password123");
        showToast("Loaded Megha R demo credentials", "info");
    };
    return (<div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F5] dark:bg-[#141010] text-[#141010] dark:text-[#FAF8F5] relative overflow-hidden transition-colors duration-300">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#810100]/15 via-[#630000]/10 to-transparent blur-3xl pointer-events-none"/>

      <div className="relative w-full max-w-md bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#810100] to-[#630000] flex items-center justify-center text-white shadow-lg cherry-glow mb-3">
            <TrendingUp className="w-7 h-7 stroke-[2.5]"/>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#141010] dark:text-[#FAF8F5]">Sign In to FinTrack</h1>
          <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0] font-medium mt-1">AI-Powered Personal Finance & Wealth Platform</p>
        </div>

        {/* Demo Fast Login Chip */}
        <div className="mb-6 p-4 bg-[#FAF8F5] dark:bg-[#141010] border border-[#810100]/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#810100] dark:text-[#FAF8F5]">
            <Sparkles className="w-4 h-4 text-[#810100] dark:text-[#E53835] shrink-0"/>
            <span>Evaluating Demo Account?</span>
          </div>
          <button type="button" onClick={fillDemoAccount} className="px-3 py-1.5 bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-xl text-xs font-black shadow-md cherry-glow transition-all">
            Auto Fill Demo
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#594D4D] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]"/>
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] placeholder-[#594D4D] focus:outline-none"/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#594D4D] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]"/>
              <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] placeholder-[#594D4D] focus:outline-none"/>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#594D4D] hover:text-[#810100] dark:hover:text-[#FAF8F5]">
                {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-xl cherry-glow flex items-center justify-center gap-2 transition-all">
            {submitting ? "Signing In..." : "Sign In"}
            <ArrowRight className="w-4 h-4"/>
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-[#594D4D]">
          Don't have an account?{" "}
          <Link href="/register" className="font-extrabold text-[#810100] dark:text-[#FAF8F5] hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>);
}
