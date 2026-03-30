"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatBDT, formatDate } from "@/lib/utils";
import { pettyCashData, MONTHS, MONTH_KEYS } from "@/lib/data";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/ui-custom/PageHeader";
import ExportCSVButton from "@/components/ui-custom/ExportCSVButton";
import { CheckCircle, Clock, ChevronDown, ChevronUp, Search } from "lucide-react";
import type { PettyCashTransaction } from "@/lib/types";

const PAGE_SIZE = 50;

export default function LedgerPage() {
  const { filteredTransactions } = useApp();

  // Filters
  const [hubFilter, setHubFilter] = useState("All");
  const [distFilter, setDistFilter] = useState("All");
  const [trxTypeFilter, setTrxTypeFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [empSearch, setEmpSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [narrationSearch, setNarrationSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const allHubs = useMemo(() => {
    const s = new Set(pettyCashData.map((t) => t.hubName).filter(Boolean));
    return ["All", ...s];
  }, []);
  const allDists = useMemo(() => {
    const s = new Set(pettyCashData.map((t) => t.distributorName).filter(Boolean));
    return ["All", ...s];
  }, []);

  const filtered = useMemo(() => {
    return filteredTransactions.filter((t) => {
      if (hubFilter !== "All" && t.hubName !== hubFilter) return false;
      if (distFilter !== "All" && t.distributorName !== distFilter) return false;
      if (trxTypeFilter !== "All" && t.trxType !== trxTypeFilter) return false;
      if (monthFilter !== "All") {
        const mIdx = MONTHS.indexOf(monthFilter);
        if (mIdx >= 0 && t.trxDate.slice(0, 7) !== MONTH_KEYS[mIdx]) return false;
      }
      if (empSearch && !t.employeeName.toLowerCase().includes(empSearch.toLowerCase())) return false;
      if (approvalFilter === "Approved" && !t.isApprove) return false;
      if (approvalFilter === "Unapproved" && t.isApprove) return false;
      if (narrationSearch && !t.trxNarration.toLowerCase().includes(narrationSearch.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.trxDate.localeCompare(a.trxDate));
  }, [filteredTransactions, hubFilter, distFilter, trxTypeFilter, monthFilter, empSearch, approvalFilter, narrationSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportData = filtered.map((t) => ({
    Date: t.trxDate, Hub: t.hubName, Distributor: t.distributorName,
    Type: t.trxType, Debit: t.debitAmt, Credit: t.creditAmt,
    Narration: t.trxNarration, Employee: t.employeeName,
    Approved: t.isApprove ? "Yes" : "No",
  }));

  function rowBg(t: PettyCashTransaction, i: number) {
    if (!t.isApprove) return "#FFFDE7";
    if (t.trxType === "Disbursed From HQ") return "#E3F2FD";
    return i % 2 === 0 ? "#fff" : "#F5F7FA";
  }

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Petty Cash Ledger"
        subtitle={`${filtered.length} transactions`}
        actions={<ExportCSVButton data={exportData as Record<string, unknown>[]} filename="ledger.csv" />}
      />

      {/* Filter Bar */}
      <Card className="p-4 mb-5 shadow-sm border-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Hub */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#595959" }}>Hub</label>
            <select
              value={hubFilter}
              onChange={(e) => { setHubFilter(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
              style={{ backgroundColor: "#F5F7FA" }}
            >
              {allHubs.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          {/* Distributor */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#595959" }}>Distributor</label>
            <select
              value={distFilter}
              onChange={(e) => { setDistFilter(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
              style={{ backgroundColor: "#F5F7FA" }}
            >
              {allDists.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {/* Trx Type */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#595959" }}>Transaction Type</label>
            <select
              value={trxTypeFilter}
              onChange={(e) => { setTrxTypeFilter(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
              style={{ backgroundColor: "#F5F7FA" }}
            >
              <option value="All">All</option>
              <option value="Add From Balance">Add From Balance</option>
              <option value="Daily Expense">Daily Expense</option>
              <option value="Disbursed From HQ">Disbursed From HQ</option>
            </select>
          </div>
          {/* Month */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#595959" }}>Month</label>
            <select
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
              style={{ backgroundColor: "#F5F7FA" }}
            >
              <option value="All">All Months</option>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {/* Employee */}
          <div className="relative">
            <label className="text-xs font-medium block mb-1" style={{ color: "#595959" }}>Employee</label>
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={empSearch}
                onChange={(e) => { setEmpSearch(e.target.value); setPage(1); }}
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded"
                style={{ backgroundColor: "#F5F7FA" }}
              />
            </div>
          </div>
          {/* Approval */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#595959" }}>Approval Status</label>
            <select
              value={approvalFilter}
              onChange={(e) => { setApprovalFilter(e.target.value); setPage(1); }}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5"
              style={{ backgroundColor: "#F5F7FA" }}
            >
              <option value="All">All</option>
              <option value="Approved">Approved</option>
              <option value="Unapproved">Unapproved</option>
            </select>
          </div>
          {/* Narration search */}
          <div className="col-span-2">
            <label className="text-xs font-medium block mb-1" style={{ color: "#595959" }}>Narration Search</label>
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search narration..."
                value={narrationSearch}
                onChange={(e) => { setNarrationSearch(e.target.value); setPage(1); }}
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded"
                style={{ backgroundColor: "#F5F7FA" }}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#1F3864" }}>
                {["Date","Hub","Distributor","Type","Debit","Credit","Employee / Narration","Status"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((t, i) => (
                <>
                  <tr
                    key={t.systemId}
                    onClick={() => setExpandedId(expandedId === t.systemId ? null : t.systemId)}
                    className="border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
                    style={{ backgroundColor: rowBg(t, i) }}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{t.trxDate}</td>
                    <td className="px-3 py-2 text-xs max-w-[100px] truncate" title={t.hubName}>{t.hubName || "—"}</td>
                    <td className="px-3 py-2 text-xs max-w-[110px] truncate" title={t.distributorName}>{t.distributorName}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      <span
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: t.trxType === "Add From Balance" ? "#DEEAF1" : t.trxType === "Disbursed From HQ" ? "#E3F2FD" : "#FFF5F5",
                          color: "#1A1A2E",
                        }}
                      >
                        {t.trxType === "Add From Balance" ? "Top-Up" : t.trxType === "Disbursed From HQ" ? "From HQ" : "Expense"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-right" style={{ color: "#70AD47" }}>
                      {t.debitAmt > 0 ? formatBDT(t.debitAmt) : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-right" style={{ color: t.creditAmt > 0 ? "#C00000" : "#595959" }}>
                      {t.creditAmt > 0 ? formatBDT(t.creditAmt) : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs max-w-[150px]">
                      <div className="truncate" title={t.trxNarration}>{t.trxNarration}</div>
                      <div className="text-gray-400 text-xs">{t.employeeName || "—"}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        {t.isApprove
                          ? <CheckCircle size={14} style={{ color: "#70AD47" }} />
                          : <Clock size={14} style={{ color: "#FFC000" }} />}
                        {expandedId === t.systemId ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </div>
                    </td>
                  </tr>
                  {expandedId === t.systemId && (
                    <tr key={`exp-${t.systemId}`} style={{ backgroundColor: "#DEEAF1" }}>
                      <td colSpan={8} className="px-5 py-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div><span className="font-medium text-gray-500">Full Narration: </span>{t.trxNarration}</div>
                          <div><span className="font-medium text-gray-500">Entry Date: </span>{t.entryDate}</div>
                          <div><span className="font-medium text-gray-500">Employee Code: </span>{t.employeeCode || "—"}</div>
                          <div><span className="font-medium text-gray-500">System ID: </span>{t.systemId}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs" style={{ color: "#595959" }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="px-3 py-1 text-xs border rounded"
                  style={{
                    borderColor: p === page ? "#2E75B6" : "#e5e7eb",
                    backgroundColor: p === page ? "#2E75B6" : "#fff",
                    color: p === page ? "#fff" : "#1A1A2E",
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
