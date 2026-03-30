import type { PettyCashTransaction, OperationalKPI } from "./types";

// === DATA START ===

export const MONTHS = [
  "Feb 2025","Mar 2025","Apr 2025","May 2025","Jun 2025","Jul 2025",
  "Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025","Jan 2026","Feb 2026","Mar 2026"
];

export const MONTH_KEYS = [
  "2025-02","2025-03","2025-04","2025-05","2025-06","2025-07",
  "2025-08","2025-09","2025-10","2025-11","2025-12","2026-01","2026-02","2026-03"
];

const HUBS = [
  { id: 1, name: "Kaliakoir Hub" },
  { id: 2, name: "Pirojpur Hub" },
  { id: 3, name: "Uttara Hub" },
  { id: 4, name: "HQ Hub" },
  { id: 5, name: "Jamalpur Sadar Hub" },
  { id: 6, name: "Dinajpur Hub" },
  { id: 7, name: "Chittagong Hub" },
  { id: 8, name: "Sylhet Hub" },
  { id: 9, name: "Dakshinkhan Hub" },
];

const DISTRIBUTORS = [
  { id: 1, name: "Unilever Bangladesh" },
  { id: 2, name: "Nestle Bangladesh" },
  { id: 3, name: "ACI Limited" },
  { id: 4, name: "Pran-RFL" },
  { id: 5, name: "Square Consumer" },
  { id: 6, name: "Bashundhara Group" },
  { id: 7, name: "Marico Bangladesh" },
  { id: 8, name: "Keya Cosmetics" },
];

const EMPLOYEES: { id: number; name: string; code: string }[] = [
  { id: 101, name: "Rahim Uddin", code: "EM-00101" },
  { id: 102, name: "Karim Ahmed", code: "EM-00102" },
  { id: 103, name: "Nasrin Akter", code: "EM-00103" },
  { id: 104, name: "Salma Begum", code: "EM-00104" },
  { id: 105, name: "Jamal Hossain", code: "EM-00105" },
  { id: 106, name: "Farida Khanam", code: "EM-00106" },
  { id: 107, name: "Sohel Rana", code: "EM-00107" },
  { id: 108, name: "Mitu Begum", code: "EM-00108" },
  { id: 109, name: "Rashed Khan", code: "EM-00109" },
  { id: 110, name: "Taslima Islam", code: "EM-00110" },
  { id: 111, name: "", code: "EM-00111" }, // unmapped — risk flag
];

const NARRATIONS = [
  "Vehicle fuel expense",
  "Office supplies purchase",
  "Driver daily allowance",
  "Loading/unloading charges",
  "Staff meal expense",
  "Stationery and printing",
  "Maintenance and repair",
  "Transport and logistics",
  "Miscellaneous expenses",
  "Cold storage charges",
  "Security guard payment",
  "Electricity bill",
  "Internet and phone bill",
  "Warehouse rent",
  "Packaging materials",
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateTransactions(): PettyCashTransaction[] {
  const transactions: PettyCashTransaction[] = [];
  let sysId = 1;
  let pcId = 1000;

  // Hub configs: target top-up and expense totals
  const hubConfigs = [
    { hub: HUBS[0], dist: DISTRIBUTORS[0], targetTopUp: 21780000, targetExpense: 10356413 },
    { hub: HUBS[1], dist: DISTRIBUTORS[1], targetTopUp: 9206000,  targetExpense: 3963697  },
    { hub: HUBS[2], dist: DISTRIBUTORS[2], targetTopUp: 2455950,  targetExpense: 1377434  },
    { hub: HUBS[3], dist: DISTRIBUTORS[3], targetTopUp: 2154220,  targetExpense: 1462664  },
    { hub: HUBS[4], dist: DISTRIBUTORS[4], targetTopUp: 1986200,  targetExpense: 1057985  },
    { hub: HUBS[5], dist: DISTRIBUTORS[5], targetTopUp: 1059000,  targetExpense: 567206   },
    { hub: HUBS[6], dist: DISTRIBUTORS[6], targetTopUp: 1012990,  targetExpense: 557001   },
    { hub: HUBS[7], dist: DISTRIBUTORS[7], targetTopUp: 674000,   targetExpense: 416684   },
    { hub: HUBS[8], dist: DISTRIBUTORS[0], targetTopUp: 30000,    targetExpense: 35338    },
  ];

  for (const cfg of hubConfigs) {
    const rand = rng(cfg.hub.id * 999 + 17);

    // Distribute across 14 months
    const monthlyTopUpBase = cfg.targetTopUp / 14;
    const monthlyExpenseBase = cfg.targetExpense / 14;

    for (let mIdx = 0; mIdx < MONTH_KEYS.length; mIdx++) {
      const monthKey = MONTH_KEYS[mIdx];
      const [yr, mo] = monthKey.split("-").map(Number);

      const monthVariance = 0.6 + rand() * 0.8;
      const monthlyTopUp = Math.round(monthlyTopUpBase * monthVariance);
      const monthlyExpense = Math.round(monthlyExpenseBase * monthVariance);

      // 1–3 top-up entries per month
      const topUpCount = 1 + Math.floor(rand() * 3);
      let remainingTopUp = monthlyTopUp;
      for (let i = 0; i < topUpCount; i++) {
        const amt = i === topUpCount - 1 ? remainingTopUp : Math.round(remainingTopUp * (0.3 + rand() * 0.5));
        remainingTopUp -= amt;
        const day = 1 + Math.floor(rand() * 25);
        const emp = EMPLOYEES[Math.floor(rand() * (EMPLOYEES.length - 1))]; // skip unmapped for top-ups
        transactions.push({
          systemId: sysId++,
          pettyCashId: pcId++,
          hubId: cfg.hub.id,
          hubName: cfg.hub.name,
          distributorId: cfg.dist.id,
          distributorName: cfg.dist.name,
          trxDate: `${yr}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
          trxType: "Add From Balance",
          debitAmt: amt,
          creditAmt: 0,
          trxNarration: "Petty cash top-up from HQ",
          isExpense: false,
          isApprove: true,
          isActive: true,
          entryBy: emp.id,
          employeeName: emp.name,
          employeeCode: emp.code,
          entryDate: `${yr}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')} 09:${String(Math.floor(rand()*59)).padStart(2,'0')}:00`,
        });
      }

      // 12–18 daily expense entries per month
      const expCount = 12 + Math.floor(rand() * 7);
      let remainingExp = monthlyExpense;
      for (let i = 0; i < expCount; i++) {
        const amt = i === expCount - 1
          ? Math.max(100, remainingExp)
          : Math.round(remainingExp * (0.05 + rand() * 0.12));
        remainingExp -= amt;
        const day = 1 + Math.floor(rand() * 27);
        const empIdx = Math.floor(rand() * EMPLOYEES.length);
        const emp = EMPLOYEES[empIdx];
        const isHQ = rand() < 0.08;
        // occasionally unapproved
        const approved = rand() > 0.07;
        // occasionally blank hub (risk)
        const useBlankHub = cfg.hub.id === HUBS[8].id && rand() < 0.1;

        transactions.push({
          systemId: sysId++,
          pettyCashId: pcId++,
          hubId: cfg.hub.id,
          hubName: useBlankHub ? "" : cfg.hub.name,
          distributorId: cfg.dist.id,
          distributorName: cfg.dist.name,
          trxDate: `${yr}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
          trxType: isHQ ? "Disbursed From HQ" : "Daily Expense",
          debitAmt: 0,
          creditAmt: Math.abs(amt),
          trxNarration: NARRATIONS[Math.floor(rand() * NARRATIONS.length)],
          isExpense: true,
          isApprove: approved,
          isActive: true,
          entryBy: emp.id,
          employeeName: emp.name,
          employeeCode: emp.code,
          entryDate: `${yr}-${String(mo).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(8+Math.floor(rand()*10)).padStart(2,'0')}:${String(Math.floor(rand()*59)).padStart(2,'0')}:00`,
        });
      }
    }
  }

  return transactions;
}

export const pettyCashData: PettyCashTransaction[] = generateTransactions();

export const operationalKPIData: OperationalKPI[] = [
  {
    hub: "Kaliakoir Hub", brand: "Unilever Bangladesh",
    returnedPct: 18.5, tripCreatePending: 2, tripClosePending: 1,
    dmsVsOmsVariance: 125000, collectionVsDepositVariance: 8000,
    targetVsAchievementVariance: -45000, slowMovingProductCount: 12,
    damageValue: 15000, creditLimit: 5000000, dueAmount: 1800000,
    creditOverflow: 0, longAgeCredit: 25, availableBalance: 3200000,
    pendingClaim: 45000, vaultBalance: 120000, expenseRatio: 2.8,
  },
  {
    hub: "Pirojpur Hub", brand: "Nestle Bangladesh",
    returnedPct: 28.3, tripCreatePending: 5, tripClosePending: 3,
    dmsVsOmsVariance: -85000, collectionVsDepositVariance: -12000,
    targetVsAchievementVariance: -125000, slowMovingProductCount: 18,
    damageValue: 32000, creditLimit: 3000000, dueAmount: 2100000,
    creditOverflow: 150000, longAgeCredit: 45, availableBalance: 900000,
    pendingClaim: 78000, vaultBalance: 85000, expenseRatio: 3.4,
  },
  {
    hub: "Uttara Hub", brand: "ACI Limited",
    returnedPct: 15.2, tripCreatePending: 1, tripClosePending: 0,
    dmsVsOmsVariance: 45000, collectionVsDepositVariance: 3500,
    targetVsAchievementVariance: 22000, slowMovingProductCount: 7,
    damageValue: 8000, creditLimit: 2500000, dueAmount: 980000,
    creditOverflow: 0, longAgeCredit: 15, availableBalance: 1520000,
    pendingClaim: 22000, vaultBalance: 65000, expenseRatio: 2.1,
  },
  {
    hub: "HQ Hub", brand: "Pran-RFL",
    returnedPct: 12.1, tripCreatePending: 0, tripClosePending: 0,
    dmsVsOmsVariance: 78000, collectionVsDepositVariance: 5500,
    targetVsAchievementVariance: 35000, slowMovingProductCount: 5,
    damageValue: 0, creditLimit: 4000000, dueAmount: 1200000,
    creditOverflow: 0, longAgeCredit: 10, availableBalance: 2800000,
    pendingClaim: 15000, vaultBalance: 95000, expenseRatio: 1.8,
  },
  {
    hub: "Jamalpur Sadar Hub", brand: "Square Consumer",
    returnedPct: 22.7, tripCreatePending: 3, tripClosePending: 2,
    dmsVsOmsVariance: -32000, collectionVsDepositVariance: -4000,
    targetVsAchievementVariance: -18000, slowMovingProductCount: 10,
    damageValue: 12000, creditLimit: 1800000, dueAmount: 850000,
    creditOverflow: 50000, longAgeCredit: 32, availableBalance: 950000,
    pendingClaim: 35000, vaultBalance: 42000, expenseRatio: 2.5,
  },
  {
    hub: "Dinajpur Hub", brand: "Bashundhara Group",
    returnedPct: 19.4, tripCreatePending: 2, tripClosePending: 1,
    dmsVsOmsVariance: 25000, collectionVsDepositVariance: 2000,
    targetVsAchievementVariance: 8000, slowMovingProductCount: 6,
    damageValue: 5000, creditLimit: 1500000, dueAmount: 620000,
    creditOverflow: 0, longAgeCredit: 20, availableBalance: 880000,
    pendingClaim: 18000, vaultBalance: 38000, expenseRatio: 2.2,
  },
  {
    hub: "Chittagong Hub", brand: "Marico Bangladesh",
    returnedPct: 16.8, tripCreatePending: 1, tripClosePending: 1,
    dmsVsOmsVariance: 38000, collectionVsDepositVariance: 3000,
    targetVsAchievementVariance: 15000, slowMovingProductCount: 8,
    damageValue: 7500, creditLimit: 2000000, dueAmount: 750000,
    creditOverflow: 0, longAgeCredit: 18, availableBalance: 1250000,
    pendingClaim: 25000, vaultBalance: 52000, expenseRatio: 2.3,
  },
  {
    hub: "Sylhet Hub", brand: "Keya Cosmetics",
    returnedPct: 20.5, tripCreatePending: 2, tripClosePending: 1,
    dmsVsOmsVariance: 15000, collectionVsDepositVariance: 1500,
    targetVsAchievementVariance: -5000, slowMovingProductCount: 9,
    damageValue: 4000, creditLimit: 1200000, dueAmount: 480000,
    creditOverflow: 0, longAgeCredit: 22, availableBalance: 720000,
    pendingClaim: 12000, vaultBalance: 28000, expenseRatio: 2.0,
  },
  {
    hub: "Dakshinkhan Hub", brand: "Unilever Bangladesh",
    returnedPct: 35.2, tripCreatePending: 8, tripClosePending: 5,
    dmsVsOmsVariance: -95000, collectionVsDepositVariance: -18000,
    targetVsAchievementVariance: -180000, slowMovingProductCount: 25,
    damageValue: 48000, creditLimit: 500000, dueAmount: 480000,
    creditOverflow: 85000, longAgeCredit: 65, availableBalance: 20000,
    pendingClaim: 95000, vaultBalance: 8000, expenseRatio: 5.8,
  },
];

// === DATA END ===
