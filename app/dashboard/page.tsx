"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { fetchDocumentsApi, fetchSessions } from "@/lib/hooks/use-api";
import type { DocumentRecord } from "@/types";
import type { ChatSession } from "@/types";
import { StatsCard } from "./_components/StatsCard";
import { RiskChart } from "./_components/RiskChart";
import { AttentionList } from "./_components/AttentionList";

export default function DashboardHomePage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDocumentsApi().catch(() => [] as DocumentRecord[]),
      fetchSessions().catch(() => [] as ChatSession[]),
    ]).then(([docs, chats]) => {
      setDocuments(docs);
      setSessions(chats);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const analyzed = documents.filter((d) => d.risk_score != null);
    const scores = analyzed.map((d) => d.risk_score!);
    const highRisk = analyzed.filter((d) => d.risk_score! > 70);
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const low = analyzed.filter((d) => d.risk_score! <= 40).length;
    const medium = analyzed.filter(
      (d) => d.risk_score! > 40 && d.risk_score! <= 70,
    ).length;
    const high = highRisk.length;

    return {
      totalDocs: analyzed.length,
      highRisk: high,
      avgRisk: avg,
      totalChats: sessions.length,
      low,
      medium,
      high,
      attentionDocs: highRisk.sort(
        (a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0),
      ),
    };
  }, [documents, sessions]);

  function avgRiskColor(score: number) {
    if (score === 0) return "text-foreground";
    if (score <= 40) return "text-green-600 dark:text-green-400";
    if (score <= 70) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-zinc-400">{t("docreview.loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("home.welcome")}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t("home.overview")}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard
          label={t("home.total_docs")}
          value={stats.totalDocs}
          color="text-foreground"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-zinc-600 dark:text-zinc-300">
              <path d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l4.122 4.12A1.5 1.5 0 0117 7.622V16.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13z" />
            </svg>
          }
        />
        <StatsCard
          label={t("home.high_risk")}
          value={stats.highRisk}
          color={stats.highRisk > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-500">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatsCard
          label={t("home.avg_risk")}
          value={stats.totalDocs > 0 ? `${stats.avgRisk}/100` : "—"}
          color={avgRiskColor(stats.avgRisk)}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-amber-500">
              <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 001.075.676L10 15.082l5.925 2.844A.75.75 0 0017 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0010 2z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatsCard
          label={t("home.conversations")}
          value={stats.totalChats}
          color="text-foreground"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-zinc-600 dark:text-zinc-300">
              <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-3.82.418l-3.124 2.832A1.125 1.125 0 018 15.86v-2.234c-1.327-.098-2.639-.27-3.93-.508C2.637 12.862 1 11.607 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      {/* Row 2: Risk Chart + Attention */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Risk Distribution */}
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/5">
          <h3 className="mb-3 text-sm font-semibold">
            {t("home.risk_overview")}
          </h3>
          <RiskChart
            low={stats.low}
            medium={stats.medium}
            high={stats.high}
          />
        </div>

        {/* Needs Attention */}
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/5">
          <h3 className="mb-3 text-sm font-semibold">
            {t("home.needs_attention")}
          </h3>
          <AttentionList documents={stats.attentionDocs} />
        </div>
      </div>

      {/* Row 3: Recent Documents + Recent Chats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Documents */}
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("home.recent_docs")}</h3>
            <Link
              href="/dashboard/document-review"
              className="text-[11px] font-medium text-zinc-500 transition-colors hover:text-foreground"
            >
              {t("home.view_all")} &rarr;
            </Link>
          </div>
          {documents.length === 0 ? (
            <p className="py-4 text-center text-xs text-zinc-400">
              {t("docreview.no_docs")}
            </p>
          ) : (
            <div className="space-y-1.5">
              {documents.slice(0, 5).map((doc) => (
                <Link
                  key={doc.id}
                  href="/dashboard/document-review"
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 text-[10px] font-bold uppercase dark:bg-white/10">
                    {doc.file_type}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">
                      {doc.file_name}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {doc.risk_score != null && (
                    <span
                      className={`text-xs font-bold ${
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
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {t("home.recent_chats")}
            </h3>
            <Link
              href="/dashboard/ai-chat"
              className="text-[11px] font-medium text-zinc-500 transition-colors hover:text-foreground"
            >
              {t("home.view_all")} &rarr;
            </Link>
          </div>
          {sessions.length === 0 ? (
            <p className="py-4 text-center text-xs text-zinc-400">
              {t("chat.no_conversations")}
            </p>
          ) : (
            <div className="space-y-1.5">
              {sessions.slice(0, 5).map((s) => (
                <Link
                  key={s.id}
                  href="/dashboard/ai-chat"
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-zinc-500">
                      <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-3.82.418l-3.124 2.832A1.125 1.125 0 018 15.86v-2.234c-1.327-.098-2.639-.27-3.93-.508C2.637 12.862 1 11.607 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium">
                      {s.title}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/document-review"
          className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur transition-colors hover:bg-black/5 sm:p-5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 3.129a.75.75 0 001.09-1.03l-4.25-4.5a.75.75 0 00-1.09 0l-4.25 4.5a.75.75 0 101.09 1.03L9.25 4.636v8.614z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {t("home.upload_doc")}
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {t("home.upload_doc_desc")}
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/ai-chat"
          className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur transition-colors hover:bg-black/5 sm:p-5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-3.82.418l-3.124 2.832A1.125 1.125 0 018 15.86v-2.234c-1.327-.098-2.639-.27-3.93-.508C2.637 12.862 1 11.607 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {t("home.new_chat")}
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {t("home.new_chat_desc")}
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/document-review"
          className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur transition-colors hover:bg-black/5 sm:p-5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm4.75 11.25a.75.75 0 001.5 0v-2.546l.943.942a.75.75 0 001.06-1.06l-2.22-2.22a.75.75 0 00-1.06 0l-2.22 2.22a.75.75 0 001.06 1.06l.937-.942v2.546z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {t("home.export_reports")}
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {t("home.export_reports_desc")}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
