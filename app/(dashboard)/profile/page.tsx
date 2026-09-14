"use client";

import React, { useState } from "react";
import { User, Mail, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "Megha R");
  const [currency, setCurrency] = useState(user?.currency || "₹");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currency }),
      });

      if (res.ok) {
        showToast("Profile preferences updated!", "success");
        await refreshUser();
      } else {
        showToast("Failed to update profile", "error");
      }
    } catch {
      showToast("Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#1B1717] dark:text-[#EDEBDD]">
          Account Settings
        </h1>
        <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-0.5">
          Manage your personal profile and display preferences.
        </p>
      </div>

      <div className="bg-[#FFFFFF] dark:bg-[#252020] border border-[#E6E1D3] dark:border-[#382D2D] rounded-3xl shadow-sm p-6 space-y-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#7A6E6E] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E6E]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F5] dark:bg-[#1B1717] border border-[#E6E1D3] dark:border-[#382D2D] rounded-xl text-xs font-bold text-[#1B1717] dark:text-[#EDEBDD] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#7A6E6E] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A6E6E]" />
              <input
                type="email"
                disabled
                value={user?.email || "demo@fintrack.com"}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F5]/60 dark:bg-[#1B1717]/60 border border-[#E6E1D3] dark:border-[#382D2D] rounded-xl text-xs font-bold text-[#7A6E6E] cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#7A6E6E] mb-1.5">Preferred Currency</label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF9F5] dark:bg-[#1B1717] border border-[#E6E1D3] dark:border-[#382D2D] rounded-xl text-xs font-black text-[#810100] dark:text-[#EDEBDD] focus:outline-none"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Preferences"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
