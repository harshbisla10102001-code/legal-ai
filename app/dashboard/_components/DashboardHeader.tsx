"use client";

import { useLanguage } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";

export function DashboardHeader({ name }: { name: string }) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            {t("header.subtitle")}
          </div>
          <div className="truncate text-sm font-semibold">
            {t("header.welcome")} {name}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <LanguageToggle />
            <span className="text-[10px] text-zinc-400">{t("lang.label")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ThemeToggle />
            <span className="text-[10px] text-zinc-400">{t("theme.label")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
