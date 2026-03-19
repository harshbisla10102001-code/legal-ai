"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useLanguage } from "@/lib/i18n";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

export function RiskChart({
  low,
  medium,
  high,
}: {
  low: number;
  medium: number;
  high: number;
}) {
  const { t } = useLanguage();
  const total = low + medium + high;

  const data = [
    { name: t("home.risk_low"), value: low },
    { name: t("home.risk_medium"), value: medium },
    { name: t("home.risk_high"), value: high },
  ];

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
        {t("home.no_data")}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--background)",
                border: "1px solid rgba(128,128,128,0.2)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2 text-xs">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: COLORS[i] }}
            />
            <span className="text-zinc-600 dark:text-zinc-400">
              {d.name}
            </span>
            <span className="font-semibold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
