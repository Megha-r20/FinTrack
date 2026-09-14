"use client";
import React, { useState, useEffect } from "react";
import { Lock, KeyRound, Check, Delete } from "lucide-react";

export function AppLockOverlay() {
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [savedPin, setSavedPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const pinInStorage = localStorage.getItem("fintrack_pin_code");
    if (pinInStorage && pinInStorage.length === 4) {
      setSavedPin(pinInStorage);
      setIsLocked(true);
    }
  }, []);

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg("");
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg("");
  };

  const verifyPin = (inputPin) => {
    if (inputPin === savedPin) {
      setIsLocked(false);
      setPin("");
    } else {
      setErrorMsg("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#141010] text-[#FAF8F5] flex flex-col items-center justify-center p-6 space-y-6 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#810100] to-[#630000] flex items-center justify-center text-white shadow-2xl cherry-glow">
        <Lock className="w-8 h-8" />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-black">FinTrack Security Lock</h2>
        <p className="text-xs text-[#C8BFB0]">Enter your 4-digit PIN to access your workspace</p>
      </div>

      {/* PIN Dots */}
      <div className="flex items-center gap-4 py-2">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              pin.length > idx
                ? "bg-[#E53835] border-[#E53835] scale-110"
                : "border-[#3B3030] bg-transparent"
            }`}
          />
        ))}
      </div>

      {errorMsg && <p className="text-xs font-bold text-rose-500 animate-shake">{errorMsg}</p>}

      {/* Numpad Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-xs w-full pt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num.toString())}
            className="w-16 h-16 rounded-2xl bg-[#201A1A] border border-[#3B3030] hover:bg-[#3B3030] text-xl font-black text-[#FAF8F5] flex items-center justify-center mx-auto active:scale-95 transition-all shadow-md"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleKeyPress("0")}
          className="w-16 h-16 rounded-2xl bg-[#201A1A] border border-[#3B3030] hover:bg-[#3B3030] text-xl font-black text-[#FAF8F5] flex items-center justify-center mx-auto active:scale-95 transition-all shadow-md"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="w-16 h-16 rounded-2xl bg-[#201A1A] border border-[#3B3030] hover:bg-[#3B3030] text-rose-400 flex items-center justify-center mx-auto active:scale-95 transition-all shadow-md"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
