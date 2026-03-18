"use client";

import { useLanguage } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  const isHindi = locale === "hi";

  return (
    <button
      type="button"
      aria-label="Toggle language"
      onClick={() => setLocale(isHindi ? "en" : "hi")}
      className="relative inline-flex h-8 w-[60px] shrink-0 cursor-pointer items-center rounded-full border border-black/10 bg-zinc-100 transition-colors duration-200 dark:border-white/10 dark:bg-zinc-800"
    >
      <span
        className={`pointer-events-none absolute flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-sm ring-1 ring-black/5 transition-transform duration-200 dark:bg-zinc-900 dark:ring-white/10 ${
          isHindi ? "translate-x-[30px]" : "translate-x-[3px]"
        }`}
      >
        {isHindi ? "हि" : "EN"}
      </span>
    </button>
  );
}
