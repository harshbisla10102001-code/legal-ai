"use client";

import { useState } from "react";
import type { DocumentRecord, DocumentAnalysis } from "@/types";
import { useLanguage } from "@/lib/i18n";

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const parts = Object.values(obj).filter((v) => typeof v === "string");
    return parts.join(" — ") || JSON.stringify(value);
  }
  return String(value ?? "");
}

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

export function AnalysisResults({
  document,
  analysis,
  onExport,
}: {
  document: DocumentRecord;
  analysis: DocumentAnalysis;
  onExport: () => void;
}) {
  const { t } = useLanguage();
  const [missingOpen, setMissingOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t("docreview.risk_score")}</h3>
        <button
          type="button"
          onClick={onExport}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
        >
          {t("docreview.export_pdf")}
        </button>
      </div>

      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${riskBg(
          analysis.risk_score,
        )} ${riskColor(analysis.risk_score)}`}
      >
        {analysis.risk_score}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {t("docreview.document_type")}
        </h4>
        <p className="mt-1 text-sm capitalize">
          {analysis.document_type.replace(/_/g, " ")}
        </p>
      </div>

      {analysis.parties.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {t("docreview.parties")}
          </h4>
          <p className="mt-1 text-sm">{analysis.parties.map(toText).join(", ")}</p>
        </div>
      )}

      <div>
        <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {t("docreview.summary")}
        </h4>
        <p className="mt-1 text-sm leading-relaxed">{analysis.summary}</p>
      </div>

      {analysis.findings.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {t("docreview.findings")}
          </h4>
          <div className="space-y-3">
            {analysis.findings.map((f, i) => (
              <div
                key={i}
                className={`rounded-lg border-l-4 p-3 ${
                  f.severity === "HIGH"
                    ? "border-red-500 bg-red-500/5"
                    : f.severity === "MEDIUM"
                      ? "border-amber-500 bg-amber-500/5"
                      : "border-green-500 bg-green-500/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
                    {f.severity}
                  </span>
                  <span className="text-xs font-medium">{f.category}</span>
                </div>
                {f.clause_excerpt && (
                  <pre className="mt-2 overflow-x-auto rounded bg-black/5 p-2 font-mono text-[11px] dark:bg-white/5">
                    {f.clause_excerpt}
                  </pre>
                )}
                <p className="mt-2 text-xs">{f.explanation}</p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Suggestion: {f.suggestion}
                </p>
                {f.indian_law_citation && (
                  <p className="mt-1 text-[10px] text-zinc-500">
                    {f.indian_law_citation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.missing_clauses.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setMissingOpen(!missingOpen)}
            className="flex w-full items-center justify-between text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400"
          >
            {t("docreview.missing_clauses")}
            <span>{missingOpen ? "−" : "+"}</span>
          </button>
          {missingOpen && (
            <ul className="mt-2 space-y-1 pl-2 text-sm">
              {analysis.missing_clauses.map((c, i) => (
                <li key={i} className="list-disc">
                  {toText(c)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {analysis.positive_aspects.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {t("docreview.positive_aspects")}
          </h4>
          <ul className="mt-2 space-y-1 pl-2 text-sm">
            {analysis.positive_aspects.map((p, i) => (
              <li key={i} className="list-disc text-green-700 dark:text-green-400">
                {toText(p)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
