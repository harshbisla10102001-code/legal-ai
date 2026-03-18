"use client";

import { useLanguage } from "@/lib/i18n";

export default function RiskAnalysisPage() {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <h1 className="text-lg font-semibold tracking-tight">
        {t("risk.title")}
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {t("risk.desc")}
      </p>
    </div>
  );
}
