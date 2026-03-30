"use client";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatBDT } from "@/lib/utils";
import type { PettyCashTransaction, OperationalKPI } from "@/lib/types";
import { useMemo } from "react";
import { MONTHS, MONTH_KEYS } from "@/lib/data";

interface Props {
  brand: string | null;
  allTransactions: PettyCashTransaction[];
  kpis: OperationalKPI[];
  onClose: () => void;
}

export default function BrandSidePanel({ brand, allTransactions, kpis, onClose }: Props) {
  const kpi = kpis.find((k) => k.brand === brand) || null;

  const hubBreakdown = useMemo(() => {
    if (!brand) return [];
    const map = new Map<string, number>();
    for (const t of allTransactions.filter((t) => t.distributorName === brand && t.creditAmt > 0)) {
      if (t.hubName) map.set(t.hubName, (map.get(t.hubName) || 0) + t.creditAmt);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([hub, expense]) => ({ hub, expense }));
  }, [brand, allTransactions]);

  const returnTrend = useMemo(() => {
    if (!kpi) return [];
    // Simulate trend around the KPI value
    return MONTHS.map((month, i) => ({
      month,
      returnPct: Math.max(0, kpi.returnedPct + (Math.sin(i) * 5 - 2.5)),
    }));
  }, [kpi]);

  return (
    <Sheet open={!!brand} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[440px] max-w-full overflow-y-auto p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span style={{ color: "#1F3864" }}>{brand}</span>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
          </SheetTitle>
        </SheetHeader>

        <div className="p-5 space-y-6">
          {/* Hub breakdown */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#1F3864" }}>Hub Breakdown</h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "#DEEAF1" }}>
                    <th className="px-3 py-2 text-left font-semibold">Hub</th>
                    <th className="px-3 py-2 text-right font-semibold">Total Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {hubBreakdown.map((row) => (
                    <tr key={row.hub} className="border-t border-gray-100 hover:bg-blue-50">
                      <td className="px-3 py-2">{row.hub}</td>
                      <td className="px-3 py-2 text-right">{formatBDT(row.expense)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Return % trend */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#1F3864" }}>Return % Trend</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={returnTrend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} interval={3} />
                <YAxis tick={{ fontSize: 9 }} unit="%" />
                <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, "Return %"]} />
                <Line type="monotone" dataKey="returnPct" stroke="#C00000" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* KPI summary */}
          {kpi && (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "#1F3864" }}>Operational KPIs</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Credit Limit", value: formatBDT(kpi.creditLimit) },
                  { label: "Due Amount", value: formatBDT(kpi.dueAmount) },
                  { label: "Slow Movers", value: `${kpi.slowMovingProductCount} SKUs` },
                  { label: "Damage Value", value: formatBDT(kpi.damageValue), red: kpi.damageValue > 0 },
                  { label: "Pending Claim", value: formatBDT(kpi.pendingClaim) },
                  { label: "Vault Balance", value: formatBDT(kpi.vaultBalance) },
                  { label: "Credit Overflow", value: formatBDT(kpi.creditOverflow), red: kpi.creditOverflow > 0 },
                  { label: "Available Balance", value: formatBDT(kpi.availableBalance) },
                ].map(({ label, value, red }) => (
                  <div key={label} className="bg-gray-50 rounded p-2">
                    <p className="text-xs" style={{ color: "#595959" }}>{label}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: red ? "#C00000" : "#1A1A2E" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
