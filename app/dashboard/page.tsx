"use client";

import { useLanguage } from "@/lib/i18n";

export default function DashboardHomePage() {
  const { t } = useLanguage();

  const cards = [
    { titleKey: "nav.ai_chat", descKey: "home.ai_chat_desc" },
    { titleKey: "nav.document_review", descKey: "home.doc_review_desc" },
    { titleKey: "nav.contract_generator", descKey: "home.contract_gen_desc" },
    { titleKey: "nav.legal_research", descKey: "home.legal_research_desc" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("home.welcome")}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t("home.choose_tool")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.titleKey}
            className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
          >
            <div className="text-sm font-semibold">{t(card.titleKey)}</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t(card.descKey)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
