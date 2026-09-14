import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "FinTrack | AI Personal Finance & Wealth Management Platform",
  description: "Production-grade personal finance application for tracking income, expenses, budgets, goals, and AI analytical insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-sans h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased bg-[#FAF8F5] dark:bg-[#141010] text-[#141010] dark:text-[#FAF8F5] transition-colors duration-300">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
