"use client";

import type { DocumentRecord } from "@/types";
import { useLanguage } from "@/lib/i18n";

export function DocumentHistorySidebar({
  documents,
  selectedId,
  onSelect,
  onNewDocument,
  loading,
}: {
  documents: DocumentRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewDocument: () => void;
  loading?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {t("docreview.history")}
        </h2>
        <button
          onClick={onNewDocument}
          title={t("docreview.new_doc")}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-lg font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          +
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {loading ? (
          <p className="px-2 py-4 text-center text-xs text-zinc-400">
            {t("docreview.loading")}
          </p>
        ) : documents.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-zinc-400">
            {t("docreview.no_docs")}
          </p>
        ) : (
          documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelect(doc.id)}
              className={`group w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                doc.id === selectedId
                  ? "bg-black/10 font-medium dark:bg-white/10"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="truncate font-medium">{doc.file_name}</div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] dark:bg-zinc-700">
                  {doc.file_type.toUpperCase()}
                </span>
                {doc.risk_score != null && (
                  <span
                    className={`font-medium ${
                      doc.risk_score <= 40
                        ? "text-green-600"
                        : doc.risk_score <= 70
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {doc.risk_score}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}
