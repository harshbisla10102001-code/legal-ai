"use client";

import { useLanguage } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

export function DashboardHeader({
  name,
  onMenuToggle,
}: {
  name: string;
  onMenuToggle?: () => void;
}) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/70 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3 dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-black/5 md:hidden dark:hover:bg-white/10"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex min-w-0 flex-col">
            <div className="text-[11px] text-zinc-600 sm:text-xs dark:text-zinc-400">
              {t("header.subtitle")}
            </div>
            <div className="truncate text-sm font-semibold">
              {t("header.welcome")} {name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center gap-1">
            <LanguageToggle />
            <span className="hidden text-[10px] text-zinc-400 sm:block">
              {t("lang.label")}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ThemeToggle />
            <span className="hidden text-[10px] text-zinc-400 sm:block">
              {t("theme.label")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
