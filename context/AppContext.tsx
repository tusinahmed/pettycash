"use client";
import React, { createContext, useContext, useState, useMemo } from "react";
import { pettyCashData, MONTHS, MONTH_KEYS } from "@/lib/data";
import { filterByDateRange } from "@/lib/calculations";
import type { PettyCashTransaction, DateRange } from "@/lib/types";

interface AppContextType {
  dateRange: DateRange;
  setDateRange: (r: DateRange) => void;
  filteredTransactions: PettyCashTransaction[];
  allTransactions: PettyCashTransaction[];
  months: string[];
  monthKeys: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: "2026-01",
    to: "2026-03",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = useMemo(
    () => filterByDateRange(pettyCashData, dateRange),
    [dateRange]
  );

  return (
    <AppContext.Provider
      value={{
        dateRange,
        setDateRange,
        filteredTransactions,
        allTransactions: pettyCashData,
        months: MONTHS,
        monthKeys: MONTH_KEYS,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
