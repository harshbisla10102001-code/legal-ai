"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
    >
      <span className="hidden sm:inline">Theme</span>
      <span className="text-xs text-zinc-600 dark:text-zinc-300">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}

