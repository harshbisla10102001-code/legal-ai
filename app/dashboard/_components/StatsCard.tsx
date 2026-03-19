"use client";

export function StatsCard({
  label,
  value,
  icon,
  color = "text-foreground",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`text-xl font-bold tracking-tight ${color}`}>
          {value}
        </div>
        <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
          {label}
        </div>
      </div>
    </div>
  );
}
