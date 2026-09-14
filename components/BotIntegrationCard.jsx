"use client";
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Bot,
  Send,
  Copy,
  RefreshCw,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function BotIntegrationCard() {
  const { showToast } = useToast();
  const [botToken, setBotToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://fintrack.app/api/bot/webhook");
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Chat Simulator State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hi! I am your FinTrack Assistant Bot. Send me a text like 'Log 150 for snacks via UPI' or 'Got 2000 salary' to record expenses instantly!",
      time: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  const fetchBotConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bot/token");
      if (res.ok) {
        const data = await res.json();
        setBotToken(data.botToken || "ft_bot_demo9872134");
        if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    try {
      const res = await fetch("/api/bot/token", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBotToken(data.botToken);
        showToast("New Bot API Token generated!", "success");
      }
    } catch {
      showToast("Error regenerating token", "error");
    }
  };

  useEffect(() => {
    fetchBotConfig();
  }, []);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
    showToast("Copied to clipboard!", "info");
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsgId = Date.now();
    const newUserMsg = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!customText) setInputMessage("");
    setSending(true);

    try {
      const res = await fetch("/api/bot/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend, token: botToken }),
      });

      if (res.ok) {
        const data = await res.json();
        const newBotMsg = {
          id: Date.now() + 1,
          sender: "bot",
          text: data.botReply || `Logged ₹${data.parsed?.amount || 100} for ${data.parsed?.description}`,
          parsed: data.parsed,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, newBotMsg]);
        window.dispatchEvent(new Event("fintrack_data_updated"));
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            text: "⚠️ Sorry, I could not parse that expense. Try: 'Log 200 for tea via UPI'",
            time: "Just now",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "❌ Error connecting to FinTrack Webhook Server",
          time: "Just now",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bot Credentials Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#141010] dark:text-[#FAF8F5]">
                WhatsApp Assistant Bot Integration
              </h3>
              <p className="text-xs text-[#594D4D] dark:text-[#C8BFB0]">
                Log transactions via text messages directly to your FinTrack account.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center gap-1 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" /> Webhook Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Webhook Endpoint */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-[#594D4D] block">Webhook Target Endpoint</label>
            <div className="flex items-center gap-2 p-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl">
              <span className="text-xs font-mono text-[#141010] dark:text-[#FAF8F5] truncate flex-1">{webhookUrl}</span>
              <button
                onClick={() => copyToClipboard(webhookUrl, "url")}
                className="p-1.5 text-[#594D4D] hover:text-[#141010] dark:hover:text-[#FAF8F5] rounded-lg transition"
                title="Copy Webhook URL"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Secret Bot Token */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-[#594D4D] block">Secret Bot API Key</label>
            <div className="flex items-center gap-2 p-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl">
              <span className="text-xs font-mono text-[#810100] dark:text-[#E53835] font-bold truncate flex-1">
                {loading ? "Loading..." : botToken}
              </span>
              <button
                onClick={() => copyToClipboard(botToken, "key")}
                className="p-1.5 text-[#594D4D] hover:text-[#141010] dark:hover:text-[#FAF8F5] rounded-lg transition"
                title="Copy Token"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleRegenerateToken}
                className="p-1.5 text-[#594D4D] hover:text-[#810100] dark:hover:text-white rounded-lg transition"
                title="Regenerate Key"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Instructions Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
          <span className="font-extrabold text-amber-800 dark:text-amber-400 block flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> How to Connect Your WhatsApp Bot:
          </span>
          <p className="text-[#594D4D] dark:text-[#C8BFB0]">
            Paste your <strong>Webhook Endpoint</strong> and <strong>Secret API Key</strong> into your WhatsApp Business Cloud API or Twilio WhatsApp webhook settings. Any text message sent to your WhatsApp number will automatically log to FinTrack!
          </p>
        </div>
      </div>

      {/* Interactive Chat Simulator */}
      <div className="bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] rounded-3xl shadow-lg overflow-hidden">
        {/* Simulator Header */}
        <div className="p-4 bg-[#FAF8F5] dark:bg-[#141010] border-b border-[#E2DBD0] dark:border-[#3B3030] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#141010] dark:text-[#FAF8F5]">
                WhatsApp Assistant Bot Live Simulator
              </h4>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Live Webhook Parser Online
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#E2DBD0]/60 dark:bg-[#3B3030] text-[#594D4D]">
            Interactive Demo
          </span>
        </div>

        {/* Message Feed */}
        <div className="p-5 space-y-4 max-h-[350px] overflow-y-auto bg-[#FAF8F5]/30 dark:bg-[#141010]/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-semibold shadow-xs space-y-1.5 ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-[#810100] to-[#630000] text-white rounded-br-none"
                    : "bg-[#FFFFFF] dark:bg-[#201A1A] border border-[#E2DBD0] dark:border-[#3B3030] text-[#141010] dark:text-[#FAF8F5] rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                {msg.parsed && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 space-y-0.5 mt-2">
                    <div>Category: {msg.parsed.categoryName}</div>
                    <div>Payment: {msg.parsed.paymentMethod}</div>
                    <div>Recorded in FinTrack Ledger ✅</div>
                  </div>
                )}
                <span className="text-[10px] opacity-70 block text-right mt-1">{msg.time}</span>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground italic">
              <Bot className="w-4 h-4 animate-bounce text-emerald-600" />
              <span>Parsing text & recording transaction...</span>
            </div>
          )}
        </div>

        {/* Sample Prompt Pills */}
        <div className="p-3 bg-[#FAF8F5]/80 dark:bg-[#141010]/80 border-t border-[#E2DBD0] dark:border-[#3B3030] flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="font-extrabold text-[#594D4D] shrink-0">Try typing:</span>
          {[
            "Log 150 for snacks via UPI",
            "Spent 350 for cab",
            "Got 2500 refund via UPI",
            "Log 1200 for books",
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(sample)}
              className="px-2.5 py-1 rounded-lg bg-background border border-border hover:bg-muted font-bold text-xs shrink-0 transition"
            >
              "{sample}"
            </button>
          ))}
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-[#FFFFFF] dark:bg-[#201A1A] border-t border-[#E2DBD0] dark:border-[#3B3030] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type an expense message (e.g. Spent 180 for Swiggy lunch via UPI)..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] rounded-xl text-xs font-bold text-[#141010] dark:text-[#FAF8F5] focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !inputMessage.trim()}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md hover:opacity-90 disabled:opacity-50 transition flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
