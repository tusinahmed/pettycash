export interface PettyCashTransaction {
  systemId: number;
  pettyCashId: number;
  hubId: number;
  hubName: string;
  distributorId: number;
  distributorName: string;
  trxDate: string; // "YYYY-MM-DD"
  trxType: "Add From Balance" | "Daily Expense" | "Disbursed From HQ";
  debitAmt: number;
  creditAmt: number;
  trxNarration: string;
  isExpense: boolean;
  isApprove: boolean;
  isActive: boolean;
  entryBy: number;
  employeeName: string;
  employeeCode: string;
  entryDate: string; // "YYYY-MM-DD HH:MM:SS"
}

export interface OperationalKPI {
  hub: string;
  brand: string;
  returnedPct: number;
  tripCreatePending: number;
  tripClosePending: number;
  dmsVsOmsVariance: number;
  collectionVsDepositVariance: number;
  targetVsAchievementVariance: number;
  slowMovingProductCount: number;
  damageValue: number;
  creditLimit: number;
  dueAmount: number;
  creditOverflow: number;
  longAgeCredit: number;
  availableBalance: number;
  pendingClaim: number;
  vaultBalance: number;
  expenseRatio: number;
}

export interface HubSummary {
  hubName: string;
  distributorName: string;
  totalTopUp: number;
  totalExpense: number;
  balance: number;
  utilizationPct: number;
  trxCount: number;
  avgDailyExpense: number;
  maxSingleDay: number;
  status: "OVERDRAWN" | "OPTIMAL" | "ACCEPTABLE" | "LOW UTILIZATION";
}

export interface RiskFlag {
  id: string;
  rule: string;
  entity: string;
  amount: number;
  count: number;
  severity: "HIGH" | "MEDIUM" | "LOW";
  recommendedAction: string;
}

export type DateRange = {
  from: string; // "YYYY-MM"
  to: string;   // "YYYY-MM"
};
