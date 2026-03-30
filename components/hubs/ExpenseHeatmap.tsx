"use client";
import { useMemo } from "react";
import { formatBDT } from "@/lib/utils";

interface Props {
  dailyMap: Map<string, number>;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function ExpenseHeatmap({ dailyMap }: Props) {
  const maxVal = useMemo(() => Math.max(1, ...dailyMap.values()), [dailyMap]);

  // Show last 3 months
  const months = useMemo(() => {
    const result: { year: number; month: number; label: string }[] = [];
    const now = new Date(2026, 2, 1); // Mar 2026
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString("en", { month: "short", year: "numeric" }),
      });
    }
    return result;
  }, []);

  function getColor(amount: number): string {
    if (amount === 0) return "#F5F7FA";
    const ratio = Math.min(amount / maxVal, 1);
    if (ratio < 0.25) return "#D6E8C8";
    if (ratio < 0.5) return "#70AD47";
    if (ratio < 0.75) return "#FFC000";
    return "#C00000";
  }

  return (
    <div className="space-y-4">
      {months.map(({ year, month, label }) => {
        const days = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const cells: (number | null)[] = [...Array(firstDay).fill(null)];
        for (let d = 1; d <= days; d++) cells.push(d);

        return (
          <div key={label}>
            <p className="text-xs font-medium mb-2" style={{ color: "#595959" }}>{label}</p>
            <div className="grid grid-cols-7 gap-1">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                <div key={d} className="text-center text-xs font-medium" style={{ color: "#595959" }}>{d}</div>
              ))}
              {cells.map((day, i) => {
                if (day === null)
                  return <div key={`empty-${i}`} />;
                const key = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const amt = dailyMap.get(key) || 0;
                return (
                  <div
                    key={key}
                    title={amt > 0 ? `${key}: ${formatBDT(amt)}` : key}
                    className="h-6 w-full rounded text-center text-xs flex items-center justify-center cursor-default"
                    style={{ backgroundColor: getColor(amt), color: amt > 0 ? "#fff" : "#ccc", fontSize: 9 }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs" style={{ color: "#595959" }}>Low</span>
        {["#D6E8C8","#70AD47","#FFC000","#C00000"].map((c) => (
          <div key={c} className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
        ))}
        <span className="text-xs" style={{ color: "#595959" }}>High</span>
      </div>
    </div>
  );
}
