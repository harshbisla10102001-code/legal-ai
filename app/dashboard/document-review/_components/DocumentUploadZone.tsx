"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useLanguage } from "@/lib/i18n";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/msword": [".doc"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

export function DocumentUploadZone({
  onFile,
  disabled,
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
    accept: ACCEPT,
    maxFiles: 1,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive
          ? "border-black/30 bg-black/5 dark:border-white/30 dark:bg-white/5"
          : "border-black/15 hover:border-black/25 dark:border-white/15 dark:hover:border-white/25"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <input {...getInputProps()} />
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("docreview.drop_hint")}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {t("docreview.accepted_formats")}
      </p>
    </div>
  );
}
