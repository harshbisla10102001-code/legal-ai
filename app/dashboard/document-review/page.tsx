"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  uploadDocumentApi,
  fetchDocumentsApi,
  fetchDocumentApi,
  processDocumentApi,
  getDocumentExportUrl,
  ApiRequestError,
} from "@/lib/hooks/use-api";
import type { DocumentRecord } from "@/types";
import { DocumentUploadZone } from "./_components/DocumentUploadZone";
import { ProcessingProgress } from "./_components/ProcessingProgress";
import { DocumentHistorySidebar } from "./_components/DocumentHistorySidebar";
import { AnalysisResults } from "./_components/AnalysisResults";

export default function DocumentReviewPage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isNewSession, setIsNewSession] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchDocumentsApi();
      setDocuments(list);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (documents.length > 0 && !selectedDoc && !processing && !isNewSession) {
      setSelectedDoc(documents[0]);
    }
  }, [documents, selectedDoc, processing, isNewSession]);

  const handleNewDocument = () => {
    setSelectedDoc(null);
    setIsNewSession(true);
    setError(null);
    setProcessing(false);
    setProgressStep(0);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setProcessing(true);
    setProgressStep(1);

    try {
      const { documentId } = await uploadDocumentApi(file);
      setProgressStep(2);

      const { document } = await processDocumentApi(
        documentId,
        (p) => {
          if (p.step) setProgressStep(p.step);
        },
      );

      setDocuments((prev) => [document, ...prev]);
      setSelectedDoc(document);
      setIsNewSession(false);
      setProgressStep(4);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : t("docreview.error"),
      );
    } finally {
      setProcessing(false);
      setProgressStep(0);
    }
  };

  const handleSelectDocument = async (id: string) => {
    setError(null);
    setIsNewSession(false);
    setLoading(true);
    try {
      const doc = await fetchDocumentApi(id);
      setSelectedDoc(doc);
    } catch {
      setError(t("docreview.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!selectedDoc) return;
    window.open(getDocumentExportUrl(selectedDoc.id), "_blank");
  };

  const showUploadZone = isNewSession || (!selectedDoc && !processing);

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-3 sm:h-[calc(100vh-6rem)]">
      {/* Sidebar */}
      <div className="hidden w-56 flex-col rounded-2xl border border-black/10 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 md:flex">
        <DocumentHistorySidebar
          documents={documents}
          selectedId={selectedDoc?.id ?? null}
          onSelect={handleSelectDocument}
          onNewDocument={handleNewDocument}
          loading={loading}
        />
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-black/10 bg-white/70 p-3 shadow-sm backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-tight">
              {t("docreview.title")}
            </h1>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {t("docreview.desc")}
            </p>
          </div>
          {/* Mobile new-doc button */}
          <button
            onClick={handleNewDocument}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-black/10 px-3 text-xs font-medium transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10 md:hidden"
          >
            <span className="text-base leading-none">+</span> {t("docreview.new")}
          </button>
        </div>

        {/* Mobile document selector */}
        <div className="mb-3 md:hidden">
          <select
            value={selectedDoc?.id ?? ""}
            onChange={(e) => {
              if (e.target.value) handleSelectDocument(e.target.value);
            }}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-xs outline-none dark:border-white/10"
          >
            {documents.length === 0 && (
              <option value="">{t("docreview.no_docs")}</option>
            )}
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.file_name} ({d.risk_score ?? "—"})
              </option>
            ))}
          </select>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {showUploadZone ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              {!processing ? (
                <>
                  <DocumentUploadZone
                    onFile={handleFile}
                    disabled={processing}
                  />
                  {documents.length === 0 && (
                    <p className="text-sm text-zinc-400">
                      {t("docreview.start_new")}
                    </p>
                  )}
                </>
              ) : (
                <div className="w-full max-w-md space-y-4">
                  <ProcessingProgress currentStep={progressStep} />
                  <p className="text-center text-xs text-zinc-500">
                    {t("docreview.uploading")}
                  </p>
                </div>
              )}
            </div>
          ) : selectedDoc ? (
            <>
              {/* Uploaded file header */}
              <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 text-xs font-bold uppercase dark:bg-white/10">
                  {selectedDoc.file_type}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {selectedDoc.file_name}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {new Date(selectedDoc.created_at).toLocaleDateString()}
                    {selectedDoc.risk_score != null && (
                      <span
                        className={`ml-2 font-medium ${
                          selectedDoc.risk_score <= 40
                            ? "text-green-600"
                            : selectedDoc.risk_score <= 70
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        Risk: {selectedDoc.risk_score}/100
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Analysis results */}
              {selectedDoc.analysis_json ? (
                <AnalysisResults
                  document={selectedDoc}
                  analysis={selectedDoc.analysis_json}
                  onExport={handleExport}
                />
              ) : (
                <p className="py-8 text-center text-sm text-zinc-500">
                  {t("docreview.loading")}
                </p>
              )}
            </>
          ) : null}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
