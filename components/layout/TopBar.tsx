"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Calendar, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { pettyCashData } from "@/lib/data";
import { useRouter } from "next/navigation";
import { MONTH_KEYS, MONTHS } from "@/lib/data";

export default function TopBar() {
  const { dateRange, setDateRange, searchQuery, setSearchQuery } = useApp();
  const [showSearch, setShowSearch] = useState(false);
  const [results, setResults] = useState<{ type: string; label: string; href: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fromIdx = MONTH_KEYS.indexOf(dateRange.from);
  const toIdx = MONTH_KEYS.indexOf(dateRange.to);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) { setResults([]); setShowSearch(false); return; }
    const seen = new Set<string>();
    const out: typeof results = [];
    for (const t of pettyCashData) {
      if (t.hubName && t.hubName.toLowerCase().includes(q) && !seen.has("hub:" + t.hubName)) {
        seen.add("hub:" + t.hubName);
        out.push({ type: "Hub", label: t.hubName, href: "/hubs" });
      }
      if (t.distributorName && t.distributorName.toLowerCase().includes(q) && !seen.has("dist:" + t.distributorName)) {
        seen.add("dist:" + t.distributorName);
        out.push({ type: "Distributor", label: t.distributorName, href: "/brands" });
      }
      if (t.employeeName && t.employeeName.toLowerCase().includes(q) && !seen.has("emp:" + t.employeeName)) {
        seen.add("emp:" + t.employeeName);
        out.push({ type: "Employee", label: t.employeeName, href: "/ledger" });
      }
      if (out.length >= 8) break;
    }
    setResults(out);
    setShowSearch(out.length > 0);
  }, [searchQuery]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center gap-4 px-4 z-40 border-b border-gray-200"
      style={{ left: "var(--sidebar-width, 240px)", backgroundColor: "#fff" }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md" ref={searchRef}>
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search hubs, distributors, employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowSearch(true)}
          className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: "#F5F7FA" }}
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setShowSearch(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
        {showSearch && (
          <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {results.map((r, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 text-left"
                onClick={() => { router.push(r.href); setShowSearch(false); setSearchQuery(""); }}
              >
                <span
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{ backgroundColor: "#DEEAF1", color: "#1F3864" }}
                >
                  {r.type}
                </span>
                <span className="text-sm text-gray-700">{r.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2 shrink-0">
        <Calendar size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500">From</span>
        <select
          value={fromIdx}
          onChange={(e) =>
            setDateRange({ ...dateRange, from: MONTH_KEYS[Number(e.target.value)] })
          }
          className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none"
          style={{ backgroundColor: "#F5F7FA" }}
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>
        <span className="text-xs text-gray-500">To</span>
        <select
          value={toIdx}
          onChange={(e) =>
            setDateRange({ ...dateRange, to: MONTH_KEYS[Number(e.target.value)] })
          }
          className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none"
          style={{ backgroundColor: "#F5F7FA" }}
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>
      </div>
    </header>
  );
}
