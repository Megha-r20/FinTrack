"use client";
import React, { useEffect, useState } from "react";
import { Plus, WifiOff, RefreshCw } from "lucide-react";
import { getOfflineQueue, syncOfflineQueue } from "@/lib/offlineStore";
import { useToast } from "@/context/ToastContext";

export function QuickAddGlobal({ onOpenModal }) {
  const { showToast } = useToast();
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnlineStatus = () => {
      const offline = !navigator.onLine;
      setIsOffline(offline);
      if (!offline) {
        handleAutoSync();
      }
    };

    const updatePending = () => {
      const q = getOfflineQueue();
      setPendingCount(q.length);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    updatePending();

    const interval = setInterval(updatePending, 3000);

    // N key shortcut listener
    const handleKeyDown = (e) => {
      if (
        e.key.toLowerCase() === "n" &&
        !["input", "textarea", "select"].includes(
          document.activeElement?.tagName?.toLowerCase()
        ) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        onOpenModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, [onOpenModal]);

  const handleAutoSync = async () => {
    const count = getOfflineQueue().length;
    if (count === 0) return;
    setSyncing(true);
    const synced = await syncOfflineQueue();
    if (synced > 0) {
      showToast(`Synced ${synced} offline transaction(s)!`, "success");
    }
    setSyncing(false);
    setPendingCount(getOfflineQueue().length);
  };

  return (
    <>
      {/* Offline Sync Banner */}
      {(isOffline || pendingCount > 0) && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#201A1A] text-[#FAF8F5] border border-[#3B3030] shadow-xl text-xs font-bold animate-in fade-in">
          {isOffline ? (
            <>
              <WifiOff className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Offline Mode ({pendingCount} queued)</span>
            </>
          ) : (
            <>
              <button
                onClick={handleAutoSync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-emerald-400 hover:underline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                <span>Sync {pendingCount} queued item(s)</span>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
