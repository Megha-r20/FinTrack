import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
const plusJakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
});
const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-heading",
});
export const metadata = {
    title: "FinTrack | Personal Expense Tracker",
    description: "Production-grade personal expense tracker application for tracking income, daily expenses, category budgets, financial goals, and household workspaces.",
    icons: {
        icon: "/logo.png",
        shortcut: "/logo.png",
        apple: "/logo.png",
    },
};
export default function RootLayout({ children }) {
    return (<html lang="en" className={`${plusJakarta.variable} ${outfit.variable} font-sans h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased tabular-nums bg-[#FAF8F5] dark:bg-[#141010] text-[#141010] dark:text-[#FAF8F5] transition-colors duration-300">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>);
}
