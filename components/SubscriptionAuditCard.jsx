"use me";
"use client";

import { useState, useEffect } from "react";
import { SparklesIcon, TagIcon, ExternalLinkIcon, CheckCircleIcon, RefreshCwIcon } from "lucide-react";

export default function SubscriptionAuditCard() {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState({});

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const toggleClaim = (index) => {
    setClaimed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border/40 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-16 bg-muted/60 rounded-xl mb-3" />
        <div className="h-16 bg-muted/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border/40 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <SparklesIcon className="w-32 h-32 text-primary" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Student Discount & Audit</h3>
            <p className="text-xs text-muted-foreground">AI-powered subscription savings opportunities</p>
          </div>
        </div>
        <button
          onClick={fetchAudit}
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition"
          title="Refresh Audit"
        >
          <RefreshCwIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/20 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Potential Monthly Savings</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{auditData?.totalPotentialMonthlySavings || 0}
            <span className="text-xs font-normal text-muted-foreground"> / month</span>
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5">
          <TagIcon className="w-3.5 h-3.5" />
          {auditData?.detectedSubscriptions?.length || 0} Deals Available
        </div>
      </div>

      <div className="space-y-3">
        {auditData?.detectedSubscriptions?.map((sub, idx) => {
          const isDone = claimed[idx];
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDone
                  ? "bg-emerald-500/5 border-emerald-500/30 opacity-80"
                  : "bg-muted/30 hover:bg-muted/50 border-border/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center font-bold text-primary shadow-xs border border-border/40">
                  {sub.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{sub.name}</span>
                    {sub.studentPrice && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                        Student Plan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Regular: <span className="line-through">₹{sub.fullPrice || sub.currentCost}</span> &rarr; Student:{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{sub.studentPrice}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {sub.url && (
                  <a
                    href={sub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted flex items-center gap-1 transition"
                  >
                    Claim Deal <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => toggleClaim(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircleIcon className="w-3.5 h-3.5" /> Applied
                    </>
                  ) : (
                    "Mark Applied"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
