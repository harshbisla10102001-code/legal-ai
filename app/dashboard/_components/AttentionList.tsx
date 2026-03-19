"use client";

import Link from "next/link";
import type { DocumentRecord } from "@/types";
import { useLanguage } from "@/lib/i18n";

function riskColor(score: number) {
  if (score <= 40) return "text-green-600 dark:text-green-400";
  if (score <= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function riskBg(score: number) {
  if (score <= 40) return "bg-green-500/10";
  if (score <= 70) return "bg-amber-500/10";
  return "bg-red-500/10";
}

export function AttentionList({ documents }: { documents: DocumentRecord[] }) {
  const { t } = useLanguage();

  if (documents.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-3">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-green-600 dark:text-green-400">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm text-green-700 dark:text-green-300">
          {t("home.all_clear")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.slice(0, 5).map((doc) => (
        <Link
          key={doc.id}
          href="/dashboard/document-review"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${riskBg(doc.risk_score ?? 0)} ${riskColor(doc.risk_score ?? 0)}`}
          >
            {doc.risk_score ?? "—"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{doc.file_name}</div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] dark:bg-zinc-700">
                {(doc.document_type ?? doc.file_type).replace(/_/g, " ").toUpperCase()}
              </span>
              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-zinc-400">
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      ))}
    </div>
  );
}
