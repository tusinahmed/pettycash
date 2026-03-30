"use client";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/utils";

interface Props {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
}

export default function ExportCSVButton({ data, filename, label = "Export CSV" }: Props) {
  return (
    <button
      onClick={() => exportToCSV(data, filename)}
      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      style={{ color: "#2E75B6" }}
    >
      <Download size={14} />
      {label}
    </button>
  );
}
