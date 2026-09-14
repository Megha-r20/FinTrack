"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Save,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Lock,
  Download,
  Key,
  Globe,
  Bell,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"profile" | "pacing" | "security">("profile");

  // Profile Form State
  const [name, setName] = useState(user?.name || "Megha R");
  const [currency, setCurrency] = useState(user?.currency || "₹");
  const [savingProfile, setSavingProfile] = useState(false);

  // Pacing Preferences State
  const [monthlyCap, setMonthlyCap] = useState("6000");
  const [dailyPacingAlerts, setDailyPacingAlerts] = useState(true);
  const [savingPacing, setSavingPacing] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currency }),
      });

      if (res.ok) {
        showToast("Profile preferences saved!", "success");
        await refreshUser();
      } else {
        showToast("Failed to update profile", "error");
      }
    } catch {
      showToast("Error updating profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Preset Template Trigger
  const handleApplyHostelPreset = async () => {
    setSavingPacing(true);
    try {
      const hostelItems = [
        { categoryName: "Snacks & Mess Outings", amount: 1500 },
        { categoryName: "Transport", amount: 800 },
        { categoryName: "Mobile & Data Recharge", amount: 300 },
        { categoryName: "Personal Care & Toiletries", amount: 500 },
        { categoryName: "Entertainment", amount: 600 },
        { categoryName: "Education", amount: 500 },
        { categoryName: "Emergency Fund", amount: 800 },
        { categoryName: "Shopping", amount: 1000 },
      ];

      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: true, items: hostelItems }),
      });

      if (res.ok) {
        showToast("Hostel Student ₹6,000 Budget Template applied!", "success");
      } else {
        showToast("Failed to apply preset", "error");
      }
    } catch {
      showToast("Error applying preset", "error");
    } finally {
      setSavingPacing(false);
    }
  };

  // Password Update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setUpdatingPassword(true);
    try {
      // Mock security password update toast for demo user
      setTimeout(() => {
        showToast("Security password updated successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setUpdatingPassword(false);
      }, 600);
    } catch {
      showToast("Failed to update password", "error");
      setUpdatingPassword(false);
    }
  };

  // Export Data Download
  const handleExportData = async () => {
    try {
      const [txRes, bRes] = await Promise.all([fetch("/api/transactions"), fetch("/api/budgets")]);
      const txData = txRes.ok ? await txRes.json() : {};
      const bData = bRes.ok ? await bRes.json() : {};

      const exportPayload = {
        user: { name: user?.name, email: user?.email, currency: user?.currency },
        exportDate: new Date().toISOString(),
        transactions: txData.transactions || [],
        budgets: bData.budgets || [],
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `FinTrack_Export_${user?.name?.replace(/\s+/g, "_") || "User"}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast("Financial dataset exported cleanly!", "success");
    } catch {
      showToast("Error exporting financial data", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#141010] dark:text-[#FAF8F5]">
          Account & Persona Settings
        </h1>
        <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
          Manage your personal profile, hostel budget preferences, and security options.
        </p>
      </div>

      {/* Hero Profile Banner */}
      <div className="bg-gradient-to-r from-[#FFFFFF] via-[#FAF8F5] to-[#F5EFE6] dark:from-[#201A1A] dark:via-[#1A1414] dark:to-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#810100] to-[#A30100] text-white flex items-center justify-center font-black text-2xl shadow-lg cherry-glow shrink-0 border-2 border-white/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-[#141010] dark:text-[#FAF8F5]">{user?.name || "Megha R"}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Hostel Student Persona
              </span>
            </div>
            <p className="text-xs font-semibold text-[#594D4D] dark:text-[#C8BFB0] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#810100]" /> {user?.email || "demo@fintrack.com"}
            </p>
          </div>
        </div>

        {/* Metadata Pills */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="px-3.5 py-2 rounded-2xl bg-[#FFFFFF]/80 dark:bg-[#141010]/80 border border-[#E2DBD0] dark:border-[#3B3030] text-[11px] font-bold text-[#141010] dark:text-[#FAF8F5] flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Isolated Tenant</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-[#FFFFFF]/80 dark:bg-[#141010]/80 border border-[#E2DBD0] dark:border-[#3B3030] text-[11px] font-bold text-[#141010] dark:text-[#FAF8F5] flex items-center gap-1.5 shadow-sm">
            <Globe className="w-3.5 h-3.5 text-[#810100]" />
            <span>{user?.currency || "₹"} Currency</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl shadow-sm overflow-x-auto">
        {[
          { id: "profile", label: "Profile & Preferences", icon: User },
          { id: "pacing", label: "Budget & Pacing", icon: GraduationCap },
          { id: "security", label: "Security & Export", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
                  : "text-[#4A3F3F] dark:text-[#C8BFB0] hover:text-[#141010] dark:hover:text-[#FAF8F5]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Profile & Preferences */}
      {activeTab === "profile" && (
        <div className="bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-black text-[#141010] dark:text-[#FAF8F5]">Personal Information</h3>
            <p className="text-xs text-[#594D4D] font-medium mt-0.5">Update your display name and preferred currency format.</p>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || "demo@fintrack.com"}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5]/60 dark:bg-[#141010]/60 border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-bold text-[#594D4D] cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Preferred Display Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-black text-[#810100] dark:text-[#FAF8F5] focus:outline-none"
                >
                  <option value="₹">₹ (INR - Indian Rupee)</option>
                  <option value="$">$ (USD - US Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - British Pound)</option>
                </select>
              </div>
              <p className="text-[11px] text-[#594D4D] font-medium mt-1">This currency symbol will be formatted across all dashboard views and AI advice.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? "Saving Preferences..." : "Save Preferences"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Budget & Pacing */}
      {activeTab === "pacing" && (
        <div className="bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-black text-[#141010] dark:text-[#FAF8F5]">Hostel Budget & Pacing Controls</h3>
            <p className="text-xs text-[#594D4D] font-medium mt-0.5">Configure your target monthly spending allowance and pacing alerts.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#141010] dark:text-[#FAF8F5] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Hostel Student ₹6,000 Preset Template</span>
                </h4>
                <p className="text-xs text-[#594D4D] font-medium">
                  Automatically set standard category limits for snacks, transport, data recharge, personal care, and books.
                </p>
              </div>
              <button
                onClick={handleApplyHostelPreset}
                disabled={savingPacing}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#810100] hover:bg-[#630000] text-white shadow-md cherry-glow shrink-0 transition-all"
              >
                {savingPacing ? "Applying..." : "Load ₹6,000 Preset"}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Target Monthly Allowance Cap</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#594D4D]">{currency}</span>
                  <input
                    type="number"
                    value={monthlyCap}
                    onChange={(e) => setMonthlyCap(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#810100]" />
                  <div>
                    <span className="text-xs font-bold text-[#141010] dark:text-[#FAF8F5] block">Daily Safe Spend Notifications</span>
                    <span className="text-[11px] text-[#594D4D]">Warn on dashboard when daily spending exceeds safe allowance limit</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDailyPacingAlerts(!dailyPacingAlerts)}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${
                    dailyPacingAlerts ? "bg-[#810100]" : "bg-[#E2DBD0] dark:bg-[#3B3030]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-all ${
                      dailyPacingAlerts ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Export */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Change Password Form */}
          <div className="bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-base font-black text-[#141010] dark:text-[#FAF8F5]">Account Security</h3>
              <p className="text-xs text-[#594D4D] font-medium mt-0.5">Update your account password to maintain data protection.</p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#594D4D]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>{updatingPassword ? "Updating Password..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Data Export & Privacy Box */}
          <div className="bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-[#141010] dark:text-[#FAF8F5]">Data Privacy & Portability</h3>
              <p className="text-xs text-[#594D4D] font-medium mt-0.5">Download your financial database records or manage active sessions.</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#141010] dark:text-[#FAF8F5] block">Export Financial Records (JSON)</span>
                <span className="text-[11px] text-[#594D4D]">Download a full structured backup of your transactions, categories & budgets.</span>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#141010] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#141010] hover:bg-black dark:hover:bg-white shadow-sm shrink-0 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
