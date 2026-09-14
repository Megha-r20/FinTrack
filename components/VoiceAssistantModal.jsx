"use client";
import React, { useState, useEffect } from "react";
import { Mic, MicOff, Sparkles, Check, X, Volume2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export function VoiceAssistantModal({ isOpen, onClose, onParsed }) {
  const { showToast } = useToast();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedResult, setParsedResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      setListening(false);
      setTranscript("");
      setParsedResult(null);
    }
  }, [isOpen]);

  const startListening = () => {
    setListening(true);
    setTranscript("Listening... Speak your expense (e.g. 'Log 150 rupees for snacks via UPI')");
    setParsedResult(null);

    // Check Web Speech API support
    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-IN";
        recognition.interimResults = false;
        recognition.onresult = (event) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          parseSpeechText(text);
          setListening(false);
        };
        recognition.onerror = () => {
          fallbackSpeechSimulation();
        };
        recognition.start();
      } catch {
        fallbackSpeechSimulation();
      }
    } else {
      fallbackSpeechSimulation();
    }
  };

  const fallbackSpeechSimulation = () => {
    setTimeout(() => {
      const demoTranscript = "Log 150 rupees for snacks and tea via UPI";
      setTranscript(demoTranscript);
      parseSpeechText(demoTranscript);
      setListening(false);
    }, 2000);
  };

  const parseSpeechText = (text) => {
    // Extract numbers
    const numbers = text.match(/\d+/g);
    const amount = numbers ? parseFloat(numbers[0]) : 150;

    // Detect payment method
    let paymentMethod = "UPI";
    if (text.toLowerCase().includes("card")) paymentMethod = "Debit Card";
    if (text.toLowerCase().includes("cash")) paymentMethod = "Cash";

    // Detect description & category
    let categoryName = "Snacks & Mess Outings";
    let description = "Voice Logged Expense";

    if (text.toLowerCase().includes("snack") || text.toLowerCase().includes("tea") || text.toLowerCase().includes("food")) {
      categoryName = "Snacks & Mess Outings";
      description = "Snacks & Tea";
    } else if (text.toLowerCase().includes("recharge") || text.toLowerCase().includes("mobile")) {
      categoryName = "Mobile & Data Recharge";
      description = "Mobile Recharge";
    } else if (text.toLowerCase().includes("cab") || text.toLowerCase().includes("auto") || text.toLowerCase().includes("bus")) {
      categoryName = "Transport";
      description = "Cab/Transport Fare";
    }

    setParsedResult({
      amount,
      description,
      categoryName,
      paymentMethod,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#201A1A] rounded-3xl shadow-2xl border border-[#E2DBD0] dark:border-[#3B3030] p-6 space-y-5 text-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-[#810100] dark:text-[#FAF8F5]">
            <Sparkles className="w-4 h-4" />
            <span>Voice Expense Assistant</span>
          </div>
          <button onClick={onClose} className="p-1 text-[#594D4D] hover:text-[#141010]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mic Pulse Button */}
        <div className="py-4">
          <button
            type="button"
            onClick={startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all shadow-xl ${
              listening
                ? "bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/20"
                : "bg-gradient-to-r from-[#810100] to-[#630000] text-white cherry-glow hover:scale-105"
            }`}
          >
            {listening ? <Mic className="w-8 h-8 animate-bounce" /> : <Volume2 className="w-8 h-8" />}
          </button>
          <span className="text-xs font-bold text-[#594D4D] block mt-3">
            {listening ? "Listening... Speak now!" : "Tap mic to record voice command"}
          </span>
        </div>

        {/* Transcript Box */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#141010] border border-[#E2DBD0] dark:border-[#3B3030] text-xs font-semibold text-[#141010] dark:text-[#FAF8F5] italic min-h-[60px] flex items-center justify-center">
          "{transcript}"
        </div>

        {/* Parsed Output Preview */}
        {parsedResult && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-2 animate-in fade-in">
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 block">
              Parsed Transaction Details:
            </span>
            <div className="text-xs font-bold text-[#141010] dark:text-[#FAF8F5] space-y-1">
              <div>Amount: ₹{parsedResult.amount}</div>
              <div>Description: {parsedResult.description}</div>
              <div>Category: {parsedResult.categoryName}</div>
              <div>Payment: {parsedResult.paymentMethod}</div>
            </div>
            <button
              onClick={() => {
                onParsed(parsedResult);
                onClose();
              }}
              className="w-full mt-2 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Apply to Form</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
