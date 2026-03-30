"use client";
import { useMemo } from "react";
import { X, CheckCircle, Clock } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import StatusBadge from "@/components/ui-custom/StatusBadge";
import ExpenseHeatmap from "./ExpenseHeatmap";
import {
  calcMonthlyTrendForHub, calcTopEmployeesForHub,
  calcTotalTopUp, calcTotalExpense, calcUtilization,
  calcDailyHeatmapForHub, getStatusFromUtil,
} from "@/lib/calculations";
import { formatBDT, formatPct, formatDate } from "@/lib/utils";
import { MONTHS } from "@/lib/data";
import type { PettyCashTransaction } from "@/lib/types";

interface Props {
  hubName: string | null;
  allTransactions: PettyCashTransaction[];
  onClose: () => void;
}

export default function HubDetailPanel({ hubName, allTransactions, onClose }: Props) {
  const hubTxns = useMemo(
    () => allTransactions.filter((t) => t.hubName === hubName),
    [hubName, allTransactions]
  );
  const topUp = useMemo(() => calcTotalTopUp(hubTxns), [hubTxns]);
  const expense = useMemo(() => calcTotalExpense(hubTxns), [hubTxns]);
  const util = useMemo(() => calcUtilization(topUp, expense), [topUp, expense]);
  const status = getStatusFromUtil(util);
  const dist = hubTxns.find((t) => t.distributorName)?.distributorName || "";
  const trend = useMemo(
    () => hubName ? calcMonthlyTrendForHub(allTransactions, hubName, MONTHS) : [],
    [hubName, allTransactions]
  );
  const employees = useMemo(
    () => hubName ? calcTopEmployeesForHub(allTransactions, hubName) : [],
    [hubName, allTransactions]
  );
  const recent20 = useMemo(
    () =>
      [...hubTxns]
        .sort((a, b) => b.trxDate.localeCompare(a.trxDate))
        .slice(0, 20),
    [hubTxns]
  );
  const heatmap = useMemo(
    () => hubName ? calcDailyHeatmapForHub(allTransactions, hubName) : new Map(),
    [hubName, allTransactions]
  );

  return (
    <Sheet open={!!hubName} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[480px] max-w-full overflow-y-auto p-0"
        style={{ width: "480px" }}
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span style={{ color: "#1F3864" }}>{hubName}</span>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </SheetTitle>
        </SheetHeader>

        <div className="p-5 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Distributor", value: dist },
              { label: "Status", value: <StatusBadge status={status} /> },
              { label: "Total Top-Up", value: formatBDT(topUp) },
              { label: "Total Expense", value: formatBDT(expense) },
              { label: "Balance", value: <span style={{ color: topUp - expense < 0 ? "#C00000" : "#1A1A2E" }}>{formatBDT(topUp - expense)}</span> },
              { label: "Utilization", value: formatPct(util) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs" style={{ color: "#595959" }}>{label}</p>
                <p className="text-sm font-semibold mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Monthly trend */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#1F3864" }}>Monthly Expense Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={2} />
                <YAxis tickFormatter={(v) => "৳" + (v / 1e6).toFixed(1) + "M"} tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v) => [formatBDT(Number(v)), "Expense"]} />
                <Line type="monotone" dataKey="expense" stroke="#2E75B6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top employees */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#1F3864" }}>Top 5 Employees by Expense</h3>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={employees} layout="vertical" margin={{ top: 2, right: 60, left: 0, bottom: 2 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v) => "৳" + (v / 1000).toFixed(0) + "K"} />
                <YAxis type="category" dataKey="employee" width={100} tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v) => [formatBDT(Number(v)), "Expense"]} />
                <Bar dataKey="expense" fill="#2E75B6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent transactions */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#1F3864" }}>Recent 20 Transactions</h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "#DEEAF1" }}>
                    <th className="px-2 py-2 text-left font-semibold">Date</th>
                    <th className="px-2 py-2 text-left font-semibold">Type</th>
                    <th className="px-2 py-2 text-right font-semibold">Amount</th>
                    <th className="px-2 py-2 text-center font-semibold">Appr.</th>
                  </tr>
                </thead>
                <tbody>
                  {recent20.map((t) => (
                    <tr key={t.systemId} className="border-t border-gray-100 hover:bg-blue-50">
                      <td className="px-2 py-1.5">{t.trxDate}</td>
                      <td className="px-2 py-1.5 max-w-[80px] truncate" title={t.trxType}>{t.trxType}</td>
                      <td className="px-2 py-1.5 text-right">
                        {t.creditAmt > 0
                          ? <span style={{ color: "#C00000" }}>{formatBDT(t.creditAmt)}</span>
                          : <span style={{ color: "#70AD47" }}>{formatBDT(t.debitAmt)}</span>}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {t.isApprove
                          ? <CheckCircle size={12} style={{ color: "#70AD47", margin: "auto" }} />
                          : <Clock size={12} style={{ color: "#FFC000", margin: "auto" }} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Heatmap */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#1F3864" }}>Daily Expense Heatmap</h3>
            <ExpenseHeatmap dailyMap={heatmap} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
