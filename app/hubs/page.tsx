"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { calcHubSummaries } from "@/lib/calculations";
import { formatBDT, formatPct } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/components/ui-custom/StatusBadge";
import PageHeader from "@/components/ui-custom/PageHeader";
import ExportCSVButton from "@/components/ui-custom/ExportCSVButton";
import HubDetailPanel from "@/components/hubs/HubDetailPanel";
import { ArrowUpDown, Search } from "lucide-react";
import type { HubSummary } from "@/lib/types";

type SortKey = keyof HubSummary;
type SortDir = "asc" | "desc";

export default function HubsPage() {
  const { filteredTransactions, allTransactions } = useApp();
  const summaries = useMemo(() => calcHubSummaries(filteredTransactions), [filteredTransactions]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalExpense");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedHub, setSelectedHub] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = summaries;
    if (search) rows = rows.filter((r) => r.hubName.toLowerCase().includes(search.toLowerCase()));
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [summaries, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const exportData = filtered.map((h) => ({
    Hub: h.hubName, Distributor: h.distributorName,
    "Top-Up": h.totalTopUp, "Expense": h.totalExpense,
    "Balance": h.balance, "Utilization%": h.utilizationPct.toFixed(1),
    "Trx Count": h.trxCount, Status: h.status,
  }));

  const SortBtn = ({ col }: { col: SortKey }) => (
    <button onClick={() => toggleSort(col)} className="ml-1 opacity-50 hover:opacity-100">
      <ArrowUpDown size={12} />
    </button>
  );

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Hub-wise Report"
        subtitle={`${filtered.length} hubs`}
        actions={<ExportCSVButton data={exportData} filename="hubs-report.csv" />}
      />

      <Card className="shadow-sm border-0 overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hub..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              style={{ backgroundColor: "#F5F7FA" }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#1F3864" }}>
                {[
                  { label: "Hub Name", key: "hubName" as SortKey },
                  { label: "Total Top-Up", key: "totalTopUp" as SortKey },
                  { label: "Total Expense", key: "totalExpense" as SortKey },
                  { label: "Balance", key: "balance" as SortKey },
                  { label: "Util %", key: "utilizationPct" as SortKey },
                  { label: "Trx Count", key: "trxCount" as SortKey },
                  { label: "Avg Daily Exp", key: "avgDailyExpense" as SortKey },
                  { label: "Max Single Day", key: "maxSingleDay" as SortKey },
                  { label: "Status", key: "status" as SortKey },
                ].map(({ label, key }) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide"
                  >
                    <span className="flex items-center">
                      {label}
                      <SortBtn col={key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((hub, i) => (
                <tr
                  key={hub.hubName}
                  onClick={() => setSelectedHub(hub.hubName)}
                  className="border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
                  style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#F5F7FA" }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "#2E75B6" }}>
                    {hub.hubName}
                  </td>
                  <td className="px-4 py-3">{formatBDT(hub.totalTopUp)}</td>
                  <td className="px-4 py-3">{formatBDT(hub.totalExpense)}</td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: hub.balance < 0 ? "#C00000" : "#1A1A2E" }}
                  >
                    {formatBDT(hub.balance)}
                  </td>
                  <td className="px-4 py-3">{formatPct(hub.utilizationPct)}</td>
                  <td className="px-4 py-3">{hub.trxCount}</td>
                  <td className="px-4 py-3">{formatBDT(hub.avgDailyExpense)}</td>
                  <td className="px-4 py-3">{formatBDT(hub.maxSingleDay)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={hub.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <HubDetailPanel
        hubName={selectedHub}
        allTransactions={allTransactions}
        onClose={() => setSelectedHub(null)}
      />
    </div>
  );
}
