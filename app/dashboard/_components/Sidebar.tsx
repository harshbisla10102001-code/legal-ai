"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const nav = [
  { href: "/dashboard/ai-chat", labelKey: "nav.ai_chat" },
  { href: "/dashboard/document-review", labelKey: "nav.document_review" },
  { href: "/dashboard/contract-generator", labelKey: "nav.contract_generator" },
  { href: "/dashboard/legal-research", labelKey: "nav.legal_research" },
  { href: "/dashboard/risk-analysis", labelKey: "nav.risk_analysis" },
  { href: "/dashboard/settings", labelKey: "nav.settings" },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="flex h-full w-full flex-col gap-2 border-r border-black/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="text-sm font-semibold"
        >
          {t("nav.brand")}
        </Link>
        <span className="rounded-full border border-black/10 px-2 py-0.5 text-[11px] text-zinc-600 dark:border-white/10 dark:text-zinc-300">
          {t("nav.role")}
        </span>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={[
                "rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-700 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10",
              ].join(" ")}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <form action="/auth/signout" method="post" className="mt-auto">
        <button
          type="submit"
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
        >
          {t("nav.sign_out")}
        </button>
      </form>
    </aside>
  );
}
