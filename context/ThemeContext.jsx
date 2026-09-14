"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");
    const applyTheme = (targetTheme) => {
        setTheme(targetTheme);
        try {
            localStorage.setItem("fintrack_theme", targetTheme);
        }
        catch { }
        const root = document.documentElement;
        if (targetTheme === "dark") {
            root.classList.add("dark");
        }
        else {
            root.classList.remove("dark");
        }
    };
    useEffect(() => {
        const savedTheme = localStorage.getItem("fintrack_theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            applyTheme(savedTheme);
        }
        else {
            applyTheme("light");
        }
    }, []);
    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
    };
    return (<ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode: applyTheme }}>
      {children}
    </ThemeContext.Provider>);
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
