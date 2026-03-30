"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { generateRiskFlags } from "@/lib/calculations";
import { formatBDT } from "@/lib/utils";
import { operationalKPIData } from "@/lib/data";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/ui-custom/StatusBadge";
import PageHeader from "@/components/ui-custom/PageHeader";
import ExportCSVButton from "@/components/ui-custom/ExportCSVButton";
import { ShieldAlert } from "lucide-react";

const SEVERITY_OPTIONS = ["All", "HIGH", "MEDIUM", "LOW"] as const;

export default function RiskFlagsPage() {
  const { filteredTransactions } = useApp();
  const [severityFilter, setSeverityFilter] = useState("All");

  const flags = useMemo(
    () => generateRiskFlags(filteredTransactions, operationalKPIData),
    [filteredTransactions]
  );

  const filtered = useMemo(() => {
    if (severityFilter === "All") return flags;
    return flags.filter((f) => f.severity === severityFilter);
  }, [flags, severityFilter]);

  const high = flags.filter((f) => f.severity === "HIGH").length;
  const medium = flags.filter((f) => f.severity === "MEDIUM").length;

  const exportData = filtered.map((f) => ({
    Rule: f.rule, Entity: f.entity, "Amount (BDT)": f.amount,
    Count: f.count, Severity: f.severity, "Recommended Action": f.recommendedAction,
  }));

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Risk Flags Register"
        subtitle={`${filtered.length} flags detected`}
        actions={<ExportCSVButton data={exportData} filename="risk-flags.csv" />}
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 shadow-sm border-0" style={{ borderTop: "3px solid #C00000" }}>
          <p className="text-xs font-medium uppercase" style={{ color: "#595959" }}>HIGH Severity</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "#C00000" }}>{high}</p>
        </Card>
        <Card className="p-4 shadow-sm border-0" style={{ borderTop: "3px solid #FFC000" }}>
          <p className="text-xs font-medium uppercase" style={{ color: "#595959" }}>MEDIUM Severity</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "#FFC000" }}>{medium}</p>
        </Card>
        <Card className="p-4 shadow-sm border-0" style={{ borderTop: "3px solid #2E75B6" }}>
          <p className="text-xs font-medium uppercase" style={{ color: "#595959" }}>Total Flags</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "#2E75B6" }}>{flags.length}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {SEVERITY_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setSeverityFilter(opt)}
            className="px-4 py-1.5 text-sm rounded-full border transition-colors font-medium"
            style={{
              backgroundColor: severityFilter === opt ? "#1F3864" : "#fff",
              borderColor: severityFilter === opt ? "#1F3864" : "#e5e7eb",
              color: severityFilter === opt ? "#fff" : "#595959",
            }}
          >
            {opt}
            {opt !== "All" && (
              <span className="ml-1 text-xs opacity-75">
                ({flags.filter((f) => f.severity === opt).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShieldAlert size={48} style={{ color: "#BDD7EE" }} />
            <p className="mt-4 text-sm" style={{ color: "#595959" }}>No risk flags for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#1F3864" }}>
                  {["Risk Flag","Hub / Entity","Amount (BDT)","Count","Severity","Recommended Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((flag, i) => (
                  <tr
                    key={flag.id}
                    className="border-b border-gray-100 hover:bg-blue-50"
                    style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#F5F7FA" }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "#1A1A2E" }}>
                      {flag.rule}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#595959" }}>
                      {flag.entity}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {flag.amount > 0 ? formatBDT(flag.amount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">{flag.count}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={flag.severity} />
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[220px]" style={{ color: "#595959" }}>
                      {flag.recommendedAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
