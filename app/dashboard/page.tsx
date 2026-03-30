"use client";
import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import {
  calcTotalTopUp, calcTotalExpense, calcUtilization,
  calcUnapproved, calcActiveHubs, calcTopHubsByExpense,
  calcMonthlyTrend, calcExpenseByDistributor,
} from "@/lib/calculations";
import { formatBDT, formatPct } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import KPICard from "@/components/dashboard/KPICard";
import RiskAlertBanner from "@/components/dashboard/RiskAlertBanner";
import TopHubsChart from "@/components/dashboard/TopHubsChart";
import MonthlyTrendChart from "@/components/dashboard/MonthlyTrendChart";
import DistributorDonutChart from "@/components/dashboard/DistributorDonutChart";
import PageHeader from "@/components/ui-custom/PageHeader";
import ExportCSVButton from "@/components/ui-custom/ExportCSVButton";
import { TrendingUp, Wallet, Percent, PiggyBank, Building, AlertCircle } from "lucide-react";
import { MONTHS } from "@/lib/data";

export default function DashboardPage() {
  const { filteredTransactions } = useApp();

  const topUp = useMemo(() => calcTotalTopUp(filteredTransactions), [filteredTransactions]);
  const expense = useMemo(() => calcTotalExpense(filteredTransactions), [filteredTransactions]);
  const util = useMemo(() => calcUtilization(topUp, expense), [topUp, expense]);
  const idle = topUp - expense;
  const activeHubs = useMemo(() => calcActiveHubs(filteredTransactions), [filteredTransactions]);
  const unapproved = useMemo(() => calcUnapproved(filteredTransactions), [filteredTransactions]);
  const topHubs = useMemo(() => calcTopHubsByExpense(filteredTransactions, 10), [filteredTransactions]);
  const monthlyTrend = useMemo(() => calcMonthlyTrend(filteredTransactions, MONTHS), [filteredTransactions]);
  const donutData = useMemo(() => calcExpenseByDistributor(filteredTransactions), [filteredTransactions]);

  const exportData = topHubs.map((h) => ({ Hub: h.hub, "Expense (BDT)": h.expense }));

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Overview Dashboard petty cash"
        subtitle="Company-wide petty cash health & operational summary"
        actions={<ExportCSVButton data={exportData} filename="dashboard-summary.csv" />}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <KPICard label="Total Top-Up Amount" value={formatBDT(topUp)} icon={<Wallet size={18} style={{ color: "#2E75B6" }} />} />
        <KPICard label="Total Expense Amount" value={formatBDT(expense)} icon={<TrendingUp size={18} style={{ color: "#2E75B6" }} />} />
        <KPICard label="Overall Utilization" value={formatPct(util)} icon={<Percent size={18} style={{ color: "#2E75B6" }} />} />
        <KPICard
          label="Idle Balance"
          value={formatBDT(idle)}
          icon={<PiggyBank size={18} style={{ color: "#2E75B6" }} />}
        />
        <KPICard label="Active Hubs" value={String(activeHubs)} icon={<Building size={18} style={{ color: "#2E75B6" }} />} />
        <KPICard
          label="Unapproved Entries"
          value={String(unapproved.count)}
          sub={`${formatBDT(unapproved.amount)} pending`}
          icon={<AlertCircle size={18} style={{ color: "#C00000" }} />}
        />
      </div>

      {/* Risk Alert Banner */}
      <RiskAlertBanner transactions={filteredTransactions} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4 shadow-sm border-0">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#1F3864" }}>
            Top 10 Hubs by Expense
          </h2>
          <TopHubsChart data={topHubs} />
        </Card>
        <Card className="p-4 shadow-sm border-0">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#1F3864" }}>
            Monthly Expense Trend (All Months)
          </h2>
          <MonthlyTrendChart data={monthlyTrend} />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 shadow-sm border-0">
          <h2 className="text-base font-semibold mb-4" style={{ color: "#1F3864" }}>
            Expense by Distributor
          </h2>
          <DistributorDonutChart data={donutData} />
        </Card>
        <Card className="p-4 shadow-sm border-0">
          <h2 className="text-base font-semibold mb-2" style={{ color: "#1F3864" }}>
            Quick Stats
          </h2>
          <div className="space-y-3 mt-4">
            {[
              { label: "Total Transactions", value: filteredTransactions.length.toLocaleString() },
              { label: "Avg Expense per Hub", value: activeHubs > 0 ? formatBDT(expense / activeHubs) : "৳0" },
              { label: "Top Distributor by Expense", value: donutData[0]?.name || "—" },
              { label: "Highest Single Month", value: (() => {
                const best = monthlyTrend.reduce((a, b) => b.expense > a.expense ? b : a, { month: "", expense: 0 });
                return `${best.month} (${formatBDT(best.expense)})`;
              })() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm" style={{ color: "#595959" }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
