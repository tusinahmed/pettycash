"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart,
} from "recharts";
import { formatBDT } from "@/lib/utils";

interface Props {
  data: { month: string; topUp: number; expense: number }[];
}

export default function MonthlyTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2E75B6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2E75B6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
        <YAxis tickFormatter={(v) => "৳" + (v / 1e6).toFixed(1) + "M"} tick={{ fontSize: 10 }} />
        <Tooltip
          formatter={(v, name) => [
            formatBDT(Number(v)),
            name === "topUp" ? "Top-Up" : "Expense",
          ]}
        />
        <Legend
          formatter={(v) => (v === "topUp" ? "Top-Up" : "Expense")}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="topUp"
          stroke="#1F3864"
          strokeWidth={2}
          fill="none"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#2E75B6"
          strokeWidth={2}
          fill="url(#expFill)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
