"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { calcBrandSummaries } from "@/lib/calculations";
import { formatBDT, formatPct } from "@/lib/utils";
import { operationalKPIData } from "@/lib/data";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/ui-custom/StatusBadge";
import PageHeader from "@/components/ui-custom/PageHeader";
import ExportCSVButton from "@/components/ui-custom/ExportCSVButton";
import BrandSidePanel from "@/components/brands/BrandSidePanel";

const STATUS_OPTIONS = ["All", "OPTIMAL", "AT RISK", "CRITICAL"] as const;

export default function BrandsPage() {
  const { filteredTransactions, allTransactions } = useApp();
  const brands = useMemo(
    () => calcBrandSummaries(filteredTransactions, operationalKPIData),
    [filteredTransactions]
  );
  const [distFilter, setDistFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [hubFilter, setHubFilter] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const allHubs = useMemo(() => {
    const hubs = new Set(filteredTransactions.map((t) => t.hubName).filter(Boolean));
    return ["All", ...hubs];
  }, [filteredTransactions]);

  const allDists = useMemo(() => {
    return ["All", ...brands.map((b) => b.distributorName)];
  }, [brands]);

  const filtered = useMemo(() => {
    return brands.filter((b) => {
      if (distFilter !== "All" && b.distributorName !== distFilter) return false;
      if (statusFilter !== "All" && b.status !== statusFilter) return false;
      if (hubFilter !== "All") {
        const hubTxns = filteredTransactions.filter(
          (t) => t.distributorName === b.distributorName && t.hubName === hubFilter
        );
        if (hubTxns.length === 0) return false;
      }
      return true;
    });
  }, [brands, distFilter, statusFilter, hubFilter, filteredTransactions]);

  const exportData = filtered.map((b) => ({
    Brand: b.distributorName, "Hubs Covered": b.hubsCovered,
    "Total Expense": b.totalExpense, "Return %": b.returnedPct.toFixed(1),
    "DMS vs OMS": b.dmsVsOms, "Credit Overflow": b.creditOverflow,
    "Damage Value": b.damageValue, Status: b.status,
  }));

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Brand / Distributor Report"
        subtitle={`${filtered.length} distributors`}
        actions={<ExportCSVButton data={exportData} filename="brands-report.csv" />}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          {
            label: "Distributor", value: distFilter, options: allDists,
            onChange: setDistFilter,
          },
          {
            label: "Hub", value: hubFilter, options: allHubs,
            onChange: setHubFilter,
          },
          {
            label: "Status", value: statusFilter, options: STATUS_OPTIONS as unknown as string[],
            onChange: setStatusFilter,
          },
        ].map(({ label, value, options, onChange }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "#595959" }}>{label}:</span>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none"
              style={{ backgroundColor: "#F5F7FA" }}
            >
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#1F3864" }}>
                {["Distributor / Brand","Hubs Covered","Total Expense","Return %","DMS vs OMS","Credit Overflow","Damage Value","Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr
                  key={b.distributorName}
                  onClick={() => setSelectedBrand(b.distributorName)}
                  className="border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
                  style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#F5F7FA" }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "#2E75B6" }}>
                    {b.distributorName}
                  </td>
                  <td className="px-4 py-3">{b.hubsCovered}</td>
                  <td className="px-4 py-3">{formatBDT(b.totalExpense)}</td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: b.returnedPct > 25 ? "#C00000" : "#1A1A2E" }}
                  >
                    {formatPct(b.returnedPct)}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{
                      backgroundColor: b.dmsVsOms < 0 ? "#FFEBEE" : "transparent",
                      color: b.dmsVsOms < 0 ? "#C00000" : "#1A1A2E",
                    }}
                  >
                    {b.dmsVsOms > 0 ? "+" : ""}{formatBDT(b.dmsVsOms)}
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: b.creditOverflow > 0 ? "#C00000" : "#1A1A2E" }}
                  >
                    {formatBDT(b.creditOverflow)}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: b.damageValue > 0 ? "#FFC000" : "#1A1A2E" }}
                  >
                    {formatBDT(b.damageValue)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <BrandSidePanel
        brand={selectedBrand}
        allTransactions={allTransactions}
        kpis={operationalKPIData}
        onClose={() => setSelectedBrand(null)}
      />
    </div>
  );
}
