"use client";
import React, { useState, useEffect } from "react";
import { Users, ChevronDown, Check, Plus, Settings, Sparkles } from "lucide-react";
import { WorkspaceManagerModal } from "./WorkspaceManagerModal";

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWsId, setActiveWsId] = useState("ws_personal");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
        if (data.activeWorkspaceId) setActiveWsId(data.activeWorkspaceId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();

    const handleUpdate = () => fetchWorkspaces();
    window.addEventListener("fintrack_workspace_changed", handleUpdate);
    return () => window.removeEventListener("fintrack_workspace_changed", handleUpdate);
  }, []);

  const activeWs = workspaces.find((w) => w.id === activeWsId) || workspaces[0] || {
    name: "Personal Workspace",
    code: "PERS-001",
    role: "OWNER",
  };

  const handleSwitch = async (id) => {
    try {
      const res = await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: id }),
      });
      if (res.ok) {
        setActiveWsId(id);
        setDropdownOpen(false);
        window.dispatchEvent(new Event("fintrack_workspace_changed"));
        window.dispatchEvent(new Event("fintrack_data_updated"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* Active Workspace Pill Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] text-xs font-black text-[#141010] dark:text-[#FAF8F5] hover:bg-[#E2DBD0]/40 transition shadow-xs"
      >
        <div className="w-5 h-5 rounded-md bg-[#810100] text-white flex items-center justify-center text-[10px]">
          {activeWs.name.charAt(0)}
        </div>
        <span className="truncate max-w-[120px] sm:max-w-[160px]">{activeWs.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#594D4D]" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] shadow-2xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase text-[#594D4D] tracking-wider">
              Switch Household Workspace
            </div>

            {workspaces.map((ws) => {
              const isSelected = ws.id === activeWsId;
              return (
                <button
                  key={ws.id}
                  onClick={() => handleSwitch(ws.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? "bg-[#810100]/10 text-[#810100] dark:text-[#FAF8F5]"
                      : "hover:bg-[#FAF8F5] dark:hover:bg-[#302929] text-[#141010] dark:text-[#FAF8F5]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="truncate max-w-[130px]">{ws.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#810100] dark:text-[#FAF8F5]" />}
                </button>
              );
            })}

            <div className="pt-1 border-t border-[#E2DBD0] dark:border-[#3B3030]">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-extrabold text-[#810100] dark:text-[#FAF8F5] hover:bg-[#810100]/10 transition"
              >
                <Users className="w-4 h-4" />
                <span>Manage / Join Workspaces</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Workspace Manager Modal */}
      <WorkspaceManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWorkspaceSwitched={(ws) => setActiveWsId(ws.id)}
      />
    </div>
  );
}
