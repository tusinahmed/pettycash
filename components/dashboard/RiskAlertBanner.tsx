"use client";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { calcHubSummaries } from "@/lib/calculations";
import type { PettyCashTransaction } from "@/lib/types";

interface Props {
  transactions: PettyCashTransaction[];
}

export default function RiskAlertBanner({ transactions }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const summaries = calcHubSummaries(transactions);
  const overdrawn = summaries.filter((h) => h.utilizationPct > 100);
  const idle = summaries.filter((h) => h.utilizationPct < 40 && h.utilizationPct > 0);

  if (overdrawn.length === 0 && idle.length === 0) return null;

  return (
    <div className="rounded-lg border overflow-hidden mb-6" style={{ borderColor: "#C00000" }}>
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ backgroundColor: "#FFF5F5" }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} style={{ color: "#C00000" }} />
          <span className="text-sm font-semibold" style={{ color: "#C00000" }}>
            Risk Alerts
          </span>
        </div>
        <button onClick={() => setDismissed(true)}>
          <X size={16} className="text-gray-400 hover:text-gray-600" />
        </button>
      </div>
      <div className="px-4 py-3 flex flex-wrap gap-2" style={{ backgroundColor: "#fff" }}>
        {overdrawn.map((h) => (
          <span
            key={h.hubName}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: "#C00000", color: "#fff" }}
          >
            OVERDRAWN: {h.hubName} ({h.utilizationPct.toFixed(1)}%)
          </span>
        ))}
        {idle.map((h) => (
          <span
            key={h.hubName}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: "#FFC000", color: "#1A1A2E" }}
          >
            IDLE FLOAT: {h.hubName} ({h.utilizationPct.toFixed(1)}%)
          </span>
        ))}
      </div>
    </div>
  );
}
