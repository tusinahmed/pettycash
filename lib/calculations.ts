import type { PettyCashTransaction, OperationalKPI, HubSummary, RiskFlag, DateRange } from "./types";
import { MONTH_KEYS } from "./data";

export function filterByDateRange(
  transactions: PettyCashTransaction[],
  range: DateRange
): PettyCashTransaction[] {
  return transactions.filter((t) => {
    const month = t.trxDate.slice(0, 7);
    return month >= range.from && month <= range.to;
  });
}

export function getDefaultDateRange(): DateRange {
  // Default: last 3 months (relative to Mar 2026)
  return { from: "2026-01", to: "2026-03" };
}

export function calcTotalTopUp(transactions: PettyCashTransaction[]): number {
  return transactions
    .filter((t) => t.trxType === "Add From Balance")
    .reduce((s, t) => s + t.debitAmt, 0);
}

export function calcTotalExpense(transactions: PettyCashTransaction[]): number {
  return transactions
    .filter((t) => t.trxType === "Daily Expense" || t.trxType === "Disbursed From HQ")
    .reduce((s, t) => s + t.creditAmt, 0);
}

export function calcUtilization(topUp: number, expense: number): number {
  if (topUp === 0) return 0;
  return (expense / topUp) * 100;
}

export function calcUnapproved(transactions: PettyCashTransaction[]): {
  count: number;
  amount: number;
} {
  const unapproved = transactions.filter((t) => !t.isApprove);
  return {
    count: unapproved.length,
    amount: unapproved.reduce((s, t) => s + t.creditAmt + t.debitAmt, 0),
  };
}

export function calcActiveHubs(transactions: PettyCashTransaction[]): number {
  const hubs = new Set(transactions.filter((t) => t.hubName).map((t) => t.hubName));
  return hubs.size;
}

export function getStatusFromUtil(util: number): HubSummary["status"] {
  if (util > 100) return "OVERDRAWN";
  if (util >= 75) return "OPTIMAL";
  if (util >= 50) return "ACCEPTABLE";
  return "LOW UTILIZATION";
}

export function calcHubSummaries(
  transactions: PettyCashTransaction[]
): HubSummary[] {
  const hubMap = new Map<string, PettyCashTransaction[]>();
  for (const t of transactions) {
    if (!t.hubName) continue;
    if (!hubMap.has(t.hubName)) hubMap.set(t.hubName, []);
    hubMap.get(t.hubName)!.push(t);
  }

  const summaries: HubSummary[] = [];
  for (const [hubName, txns] of hubMap) {
    const topUp = calcTotalTopUp(txns);
    const expense = calcTotalExpense(txns);
    const balance = topUp - expense;
    const util = calcUtilization(topUp, expense);

    // active days = distinct dates with expense
    const expenseDates = new Set(
      txns.filter((t) => t.creditAmt > 0).map((t) => t.trxDate)
    );
    const activeDays = expenseDates.size || 1;

    // max single day
    const dailyMap = new Map<string, number>();
    for (const t of txns) {
      if (t.creditAmt > 0) {
        dailyMap.set(t.trxDate, (dailyMap.get(t.trxDate) || 0) + t.creditAmt);
      }
    }
    const maxSingleDay = Math.max(0, ...dailyMap.values());

    const dist = txns.find((t) => t.distributorName)?.distributorName || "";

    summaries.push({
      hubName,
      distributorName: dist,
      totalTopUp: topUp,
      totalExpense: expense,
      balance,
      utilizationPct: util,
      trxCount: txns.filter((t) => t.trxType === "Daily Expense").length,
      avgDailyExpense: expense / activeDays,
      maxSingleDay,
      status: getStatusFromUtil(util),
    });
  }

  return summaries.sort((a, b) => b.totalExpense - a.totalExpense);
}

export function calcMonthlyTrend(
  transactions: PettyCashTransaction[],
  months: string[]
): { month: string; topUp: number; expense: number }[] {
  return months.map((m, i) => {
    const mk = MONTH_KEYS[i];
    const monthTxns = transactions.filter((t) => t.trxDate.slice(0, 7) === mk);
    return {
      month: m,
      topUp: calcTotalTopUp(monthTxns),
      expense: calcTotalExpense(monthTxns),
    };
  });
}

export function calcMonthlyTrendForHub(
  transactions: PettyCashTransaction[],
  hubName: string,
  months: string[]
): { month: string; expense: number }[] {
  const hubTxns = transactions.filter((t) => t.hubName === hubName);
  return months.map((m, i) => {
    const mk = MONTH_KEYS[i];
    const monthTxns = hubTxns.filter((t) => t.trxDate.slice(0, 7) === mk);
    return { month: m, expense: calcTotalExpense(monthTxns) };
  });
}

export function calcTopHubsByExpense(
  transactions: PettyCashTransaction[],
  limit = 10
): { hub: string; expense: number }[] {
  const summaries = calcHubSummaries(transactions);
  return summaries
    .slice(0, limit)
    .map((s) => ({ hub: s.hubName, expense: s.totalExpense }));
}

export function calcExpenseByDistributor(
  transactions: PettyCashTransaction[]
): { name: string; value: number }[] {
  const distMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.creditAmt > 0 && t.distributorName) {
      distMap.set(
        t.distributorName,
        (distMap.get(t.distributorName) || 0) + t.creditAmt
      );
    }
  }
  const sorted = [...distMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  if (sorted.length <= 8) return sorted;
  const top8 = sorted.slice(0, 8);
  const others = sorted.slice(8).reduce((s, x) => s + x.value, 0);
  return [...top8, { name: "Others", value: others }];
}

export function calcTopEmployeesForHub(
  transactions: PettyCashTransaction[],
  hubName: string,
  limit = 5
): { employee: string; expense: number }[] {
  const empMap = new Map<string, number>();
  for (const t of transactions.filter(
    (t) => t.hubName === hubName && t.creditAmt > 0 && t.employeeName
  )) {
    empMap.set(t.employeeName, (empMap.get(t.employeeName) || 0) + t.creditAmt);
  }
  return [...empMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([employee, expense]) => ({ employee, expense }));
}

export function calcDailyHeatmapForHub(
  transactions: PettyCashTransaction[],
  hubName: string
): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of transactions.filter(
    (t) => t.hubName === hubName && t.creditAmt > 0
  )) {
    map.set(t.trxDate, (map.get(t.trxDate) || 0) + t.creditAmt);
  }
  return map;
}

export function calcBrandSummaries(
  transactions: PettyCashTransaction[],
  kpis: OperationalKPI[]
): {
  distributorName: string;
  hubsCovered: number;
  totalExpense: number;
  returnedPct: number;
  dmsVsOms: number;
  creditOverflow: number;
  damageValue: number;
  status: "OPTIMAL" | "AT RISK" | "CRITICAL";
  kpi: OperationalKPI | null;
}[] {
  const distMap = new Map<string, { hubs: Set<string>; expense: number }>();
  for (const t of transactions) {
    if (!t.distributorName) continue;
    if (!distMap.has(t.distributorName))
      distMap.set(t.distributorName, { hubs: new Set(), expense: 0 });
    const d = distMap.get(t.distributorName)!;
    if (t.hubName) d.hubs.add(t.hubName);
    if (t.creditAmt > 0) d.expense += t.creditAmt;
  }

  return [...distMap.entries()].map(([name, data]) => {
    const kpi = kpis.find((k) => k.brand === name) || null;
    const returnedPct = kpi?.returnedPct ?? 0;
    const dmsVsOms = kpi?.dmsVsOmsVariance ?? 0;
    const creditOverflow = kpi?.creditOverflow ?? 0;
    const damageValue = kpi?.damageValue ?? 0;

    let flags = 0;
    if (returnedPct > 25) flags++;
    if (dmsVsOms < 0) flags++;
    if (creditOverflow > 0) flags++;
    if (damageValue > 0) flags++;

    const status =
      flags === 0 ? "OPTIMAL" : flags <= 2 ? "AT RISK" : "CRITICAL";

    return {
      distributorName: name,
      hubsCovered: data.hubs.size,
      totalExpense: data.expense,
      returnedPct,
      dmsVsOms,
      creditOverflow,
      damageValue,
      status,
      kpi,
    };
  });
}

export function generateRiskFlags(
  transactions: PettyCashTransaction[],
  kpis: OperationalKPI[]
): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const hubs = calcHubSummaries(transactions);

  // Hub over 100%
  for (const h of hubs.filter((h) => h.utilizationPct > 100)) {
    flags.push({
      id: `overdrawn-${h.hubName}`,
      rule: "Hub Utilization > 100%",
      entity: h.hubName,
      amount: h.totalExpense - h.totalTopUp,
      count: 1,
      severity: "HIGH",
      recommendedAction: "Immediate top-up required. Review excessive spending.",
    });
  }

  // Hub under 40%
  for (const h of hubs.filter((h) => h.utilizationPct < 40 && h.utilizationPct > 0)) {
    flags.push({
      id: `low-util-${h.hubName}`,
      rule: "Hub Utilization < 40%",
      entity: h.hubName,
      amount: h.totalTopUp - h.totalExpense,
      count: 1,
      severity: "MEDIUM",
      recommendedAction: "Review idle float. Consider reducing top-up amount.",
    });
  }

  // Unapproved entries
  const unapproved = transactions.filter((t) => !t.isApprove);
  if (unapproved.length > 0) {
    const hubGroups = new Map<string, PettyCashTransaction[]>();
    for (const t of unapproved) {
      const key = t.hubName || "Unknown Hub";
      if (!hubGroups.has(key)) hubGroups.set(key, []);
      hubGroups.get(key)!.push(t);
    }
    for (const [hub, txns] of hubGroups) {
      flags.push({
        id: `unapproved-${hub}`,
        rule: "Unapproved entries exist",
        entity: hub,
        amount: txns.reduce((s, t) => s + t.creditAmt, 0),
        count: txns.length,
        severity: "MEDIUM",
        recommendedAction: "Review and approve pending transactions.",
      });
    }
  }

  // Single day expense > 30,000
  const dailyMap = new Map<string, number>();
  for (const t of transactions.filter((t) => t.creditAmt > 0)) {
    const key = `${t.hubName}|${t.trxDate}`;
    dailyMap.set(key, (dailyMap.get(key) || 0) + t.creditAmt);
  }
  for (const [key, amt] of dailyMap) {
    if (amt > 30000) {
      const [hub, date] = key.split("|");
      flags.push({
        id: `highday-${hub}-${date}`,
        rule: "Single day expense > ৳30,000",
        entity: `${hub} on ${date}`,
        amount: amt,
        count: 1,
        severity: "MEDIUM",
        recommendedAction: "Verify high-value daily transactions for legitimacy.",
      });
    }
  }

  // Blank hub name
  const blankHubTxns = transactions.filter((t) => !t.hubName);
  if (blankHubTxns.length > 0) {
    flags.push({
      id: "blank-hub",
      rule: "No HubName on transaction",
      entity: "Various",
      amount: blankHubTxns.reduce((s, t) => s + t.creditAmt + t.debitAmt, 0),
      count: blankHubTxns.length,
      severity: "HIGH",
      recommendedAction: "Assign hub to unmapped transactions immediately.",
    });
  }

  // Unmapped employee
  const blankEmpTxns = transactions.filter((t) => !t.employeeName);
  if (blankEmpTxns.length > 0) {
    flags.push({
      id: "unmapped-emp",
      rule: "Unmapped Employee ID",
      entity: "Various",
      amount: blankEmpTxns.reduce((s, t) => s + t.creditAmt + t.debitAmt, 0),
      count: blankEmpTxns.length,
      severity: "HIGH",
      recommendedAction: "Map employee IDs in the system. Check for ghost entries.",
    });
  }

  // Return % > 25%
  for (const kpi of kpis.filter((k) => k.returnedPct > 25)) {
    flags.push({
      id: `return-${kpi.hub}`,
      rule: "Return % > 25% for hub",
      entity: `${kpi.hub} / ${kpi.brand}`,
      amount: 0,
      count: Math.round(kpi.returnedPct),
      severity: "MEDIUM",
      recommendedAction: "Investigate return reasons. Review distributor performance.",
    });
  }

  // Credit overflow
  for (const kpi of kpis.filter((k) => k.creditOverflow > 0)) {
    flags.push({
      id: `overflow-${kpi.hub}`,
      rule: "Credit Overflow > 0",
      entity: `${kpi.hub} / ${kpi.brand}`,
      amount: kpi.creditOverflow,
      count: 1,
      severity: "MEDIUM",
      recommendedAction: "Collect outstanding dues before further credit extension.",
    });
  }

  return flags;
}
