"use client";

import React, { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 transform translate-y-0 animate-in slide-in-from-bottom-5 ${
              toast.type === "success"
                ? "bg-[#FFFFFF] dark:bg-[#252020] text-emerald-800 dark:text-emerald-300 border-emerald-500/40 dark:border-emerald-800/60 shadow-lg"
                : toast.type === "error"
                ? "bg-[#FFFFFF] dark:bg-[#252020] text-rose-800 dark:text-rose-300 border-rose-500/40 dark:border-rose-800/60 shadow-lg"
                : toast.type === "warning"
                ? "bg-[#FFFFFF] dark:bg-[#252020] text-amber-800 dark:text-amber-300 border-amber-500/40 dark:border-amber-800/60 shadow-lg"
                : "bg-[#FFFFFF] dark:bg-[#252020] text-[#1B1717] dark:text-[#EDEBDD] border-[#810100]/40 dark:border-[#810100]/60 shadow-lg"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
              {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-[#810100] dark:text-[#E58887] shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-70 transition-opacity ml-3 text-[#7A6E6E] hover:text-[#1B1717] dark:hover:text-[#EDEBDD]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
