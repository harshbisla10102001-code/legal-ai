"use client";

import { useLanguage } from "@/lib/i18n";

const STEPS = [
  "docreview.step1",
  "docreview.step2",
  "docreview.step3",
  "docreview.step4",
] as const;

export function ProcessingProgress({ currentStep }: { currentStep: number }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((key, i) => {
        const isActive = i + 1 <= currentStep;
        return (
          <div key={key} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-2 w-full rounded-full transition-colors ${
                isActive ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
            <span
              className={`text-[10px] ${isActive ? "font-medium" : "text-zinc-400"}`}
            >
              {t(key)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
