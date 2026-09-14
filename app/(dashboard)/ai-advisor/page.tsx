"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, Sparkles, Trash2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const PRESET_QUESTIONS = [
  "How much can I safely spend per day for the rest of this month?",
  "Am I spending too much on snacks outside the mess?",
  "How can I reallocate my remaining budget to save ₹1,000 this month?",
  "Where can I cut down without affecting essential personal care and books?",
  "What is my current monthly savings rate?",
  "Are any of my hostel budgets near or over their limits?",
];

export default function AiAdvisorPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat");
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversationId);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || sending) return;

    setInputMessage("");
    setSending(true);

    const tempUserMsg = { id: Math.random().toString(), role: "user", content: query };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          conversationId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversationId) setConversationId(data.conversationId);
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
          return [...filtered, data.userMessage, data.aiMessage];
        });
      } else {
        showToast("Failed to generate AI response", "error");
      }
    } catch {
      showToast("Error communicating with AI Advisor", "error");
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm("Clear all conversation history?")) return;
    try {
      const res = await fetch("/api/ai/chat", { method: "DELETE" });
      if (res.ok) {
        setMessages([]);
        showToast("Chat history cleared", "success");
      }
    } catch {
      showToast("Failed to clear chat", "error");
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#810100] to-[#630000] flex items-center justify-center text-white shadow-md cherry-glow">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#141010] dark:text-[#FAF8F5]">
              AI Financial Advisor
            </h1>
          </div>
          <p className="text-xs text-[#4A3F3F] dark:text-[#C8BFB0] font-medium mt-1">
            Ask questions about your transactions, spending habits, budget alerts, and savings trends.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#810100] dark:text-[#FAF8F5] hover:bg-[#810100]/10 border border-[#810100]/30 transition-colors self-start md:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      <div className="p-3.5 rounded-2xl bg-[#810100]/10 border border-[#810100]/30 text-[#810100] dark:text-[#FAF8F5] text-xs font-semibold flex items-center gap-2 shrink-0">
        <ShieldAlert className="w-4 h-4 shrink-0 text-[#810100] dark:text-[#E53835]" />
        <span>
          <strong>Educational Disclaimer:</strong> FinTrack AI provides automated analysis of your submitted records. It does not provide professional financial or investment advice.
        </span>
      </div>

      <div className="flex-1 bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#810100]/10 text-[#810100] dark:text-[#FAF8F5] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#141010] dark:text-[#FAF8F5]">Ask your AI Financial Assistant</h3>
                <p className="text-xs text-[#594D4D] max-w-sm mt-1 font-medium">
                  Select a suggested question below or type custom queries grounded in your real transaction metrics.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl pt-2">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-[#FAF8F5] hover:bg-[#E2DBD0]/60 dark:bg-[#141010] dark:hover:bg-[#302929] text-[#141010] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] transition-all text-left shadow-sm"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#810100] to-[#630000] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#810100] to-[#630000] text-white shadow-md cherry-glow rounded-tr-none"
                      : "bg-[#FAF8F5] dark:bg-[#141010] text-[#141010] dark:text-[#FAF8F5] border border-[#E2DBD0] dark:border-[#3B3030] rounded-tl-none shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-[#810100] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
                  </div>
                )}
              </div>
            ))
          )}

          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#810100] to-[#630000] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-tl-none flex items-center gap-2 text-xs text-[#594D4D] font-bold">
                <div className="w-2 h-2 rounded-full bg-[#810100] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#810100] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#810100] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">Analyzing database records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-[#E2DBD0] dark:border-[#3B3030] bg-[#FAF8F5] dark:bg-[#141010]/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI Advisor about your income, spending habits, or budgets..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-2xl text-xs md:text-sm font-semibold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-[#810100] to-[#630000] disabled:opacity-40 text-white shadow-md cherry-glow transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
