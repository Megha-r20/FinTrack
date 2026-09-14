"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Copy,
  Check,
  X,
  ShieldCheck,
  UserCheck,
  Building,
  Key,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

export function WorkspaceManagerModal({ isOpen, onClose, onWorkspaceSwitched }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("list"); // "list" | "create" | "join"
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWsId, setActiveWsId] = useState("ws_personal");
  const [loading, setLoading] = useState(true);

  // Form states
  const [wsName, setWsName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
        if (data.activeWorkspaceId) setActiveWsId(data.activeWorkspaceId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWorkspaces();
    }
  }, [isOpen]);

  const handleSwitch = async (id) => {
    try {
      const res = await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: id }),
      });
      if (res.ok) {
        setActiveWsId(id);
        const selected = workspaces.find((w) => w.id === id);
        showToast(`Switched to "${selected?.name || "Workspace"}"!`, "success");
        if (onWorkspaceSwitched) onWorkspaceSwitched(selected);
        window.dispatchEvent(new Event("fintrack_workspace_changed"));
        onClose();
      }
    } catch {
      showToast("Error switching workspace", "error");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!wsName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: wsName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces((prev) => [...prev, data.workspace]);
        setActiveWsId(data.workspace.id);
        showToast(`Workspace "${data.workspace.name}" created!`, "success");
        setWsName("");
        setActiveTab("list");
        if (onWorkspaceSwitched) onWorkspaceSwitched(data.workspace);
        window.dispatchEvent(new Event("fintrack_workspace_changed"));
      } else {
        showToast("Failed to create workspace", "error");
      }
    } catch {
      showToast("Error creating workspace", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces((prev) => [...prev, data.workspace]);
        setActiveWsId(data.workspace.id);
        showToast(`Joined "${data.workspace.name}"!`, "success");
        setJoinCode("");
        setActiveTab("list");
        if (onWorkspaceSwitched) onWorkspaceSwitched(data.workspace);
        window.dispatchEvent(new Event("fintrack_workspace_changed"));
      } else {
        showToast("Failed to join workspace", "error");
      }
    } catch {
      showToast("Error joining workspace", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast(`Invite code ${code} copied! Share with roommates.`, "info");
  };

  if (!isOpen) return null;

  const currentActiveWs = workspaces.find((w) => w.id === activeWsId) || workspaces[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2DBD0] dark:border-[#3B3030] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#810100] to-[#630000] text-white shadow-md cherry-glow">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#141010] dark:text-[#FAF8F5]">
                Household & Team Workspaces
              </h3>
              <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0]">
                Collaborate on shared budgets, room outings, and household bills.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#594D4D] hover:text-[#141010] dark:hover:text-[#FAF8F5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 p-1 bg-[#FAF8F5] dark:bg-[#141010] rounded-2xl border border-[#E2DBD0] dark:border-[#3B3030] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === "list" ? "bg-[#810100] text-white shadow-sm" : "text-[#594D4D]"
            }`}
          >
            My Workspaces ({workspaces.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === "create" ? "bg-[#810100] text-white shadow-sm" : "text-[#594D4D]"
            }`}
          >
            + Create Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("join")}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === "join" ? "bg-[#810100] text-white shadow-sm" : "text-[#594D4D]"
            }`}
          >
            Join via Code
          </button>
        </div>

        {/* TAB 1: Workspaces List */}
        {activeTab === "list" && (
          <div className="space-y-4">
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWsId;
                return (
                  <div
                    key={ws.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isActive
                        ? "bg-[#810100]/5 border-[#810100] dark:border-[#E53835]"
                        : "bg-[#FAF8F5]/60 dark:bg-[#141010] border-[#E2DBD0] dark:border-[#3B3030]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-[#810100] dark:text-[#FAF8F5] border border-border shadow-xs">
                        {ws.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#141010] dark:text-[#FAF8F5]">
                            {ws.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold border border-emerald-500/30">
                              Active Session
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#594D4D]">
                          Code: <span className="font-mono font-bold text-[#141010] dark:text-[#FAF8F5]">{ws.code}</span> • Role:{" "}
                          <span className="font-semibold text-[#810100] dark:text-[#E53835]">{ws.role}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyInviteCode(ws.code)}
                        className="p-2 rounded-lg border border-border bg-background text-xs text-[#594D4D] hover:text-[#141010] dark:hover:text-[#FAF8F5]"
                        title="Copy Invite Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {!isActive && (
                        <button
                          onClick={() => handleSwitch(ws.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#810100] text-white text-xs font-black cherry-glow hover:opacity-90 transition"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Active Workspace Members Drawer */}
            {currentActiveWs && (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#141010] dark:text-[#FAF8F5] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Members in "{currentActiveWs.name}":</span>
                  </span>
                  <button
                    onClick={() => copyInviteCode(currentActiveWs.code)}
                    className="text-xs font-bold text-[#810100] dark:text-[#FAF8F5] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Invite Code ({currentActiveWs.code})
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentActiveWs.members?.map((m, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-bold flex items-center gap-2 shadow-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{m.name}</span>
                      <span className="text-[10px] text-[#594D4D] uppercase">({m.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Create Workspace */}
        {activeTab === "create" && (
          <form onSubmit={handleCreate} className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <span className="font-extrabold text-amber-800 dark:text-amber-400 block flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Create a Household or Room Workspace
              </span>
              <p className="text-[#594D4D] dark:text-[#C8BFB0]">
                Organize shared flat expenses, grocery budgets, or trip pools. You will receive an Invite Code to share with members.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">
                Workspace Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hostel Flat 302 / Goa Vacation Trip"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-4 py-2.5 text-xs font-bold text-[#594D4D]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#810100] text-white cherry-glow shadow-md"
              >
                {submitting ? "Creating..." : "Create Workspace"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Join Workspace */}
        {activeTab === "join" && (
          <form onSubmit={handleJoin} className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-400 block flex items-center gap-1.5">
                <Key className="w-4 h-4" /> Join Existing Workspace
              </span>
              <p className="text-[#594D4D] dark:text-[#C8BFB0]">
                Enter the 6-character Invite Code shared by your flatmate or family owner.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#594D4D] mb-1.5">
                6-Character Invite Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FLAT-302"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl text-xs font-mono font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className="px-4 py-2.5 text-xs font-bold text-[#594D4D]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white shadow-md"
              >
                {submitting ? "Joining..." : "Join Workspace"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
