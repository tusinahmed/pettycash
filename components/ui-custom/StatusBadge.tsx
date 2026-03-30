import { cn } from "@/lib/utils";

type Status = "OVERDRAWN" | "OPTIMAL" | "ACCEPTABLE" | "LOW UTILIZATION" | "OPTIMAL" | "AT RISK" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const CONFIG: Record<string, { bg: string; text: string }> = {
  OVERDRAWN:        { bg: "#C00000", text: "#fff" },
  OPTIMAL:          { bg: "#70AD47", text: "#fff" },
  ACCEPTABLE:       { bg: "#FFC000", text: "#1A1A2E" },
  "LOW UTILIZATION":{ bg: "#ED7D31", text: "#fff" },
  "AT RISK":        { bg: "#FFC000", text: "#1A1A2E" },
  CRITICAL:         { bg: "#C00000", text: "#fff" },
  HIGH:             { bg: "#C00000", text: "#fff" },
  MEDIUM:           { bg: "#FFC000", text: "#1A1A2E" },
  LOW:              { bg: "#2E75B6", text: "#fff" },
};

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = CONFIG[status] || { bg: "#BDD7EE", text: "#1A1A2E" };
  return (
    <span
      className={cn("inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide", className)}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {status}
    </span>
  );
}
