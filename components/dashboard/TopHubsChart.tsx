"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from "recharts";
import { formatBDT } from "@/lib/utils";

interface Props {
  data: { hub: string; expense: number }[];
}

export default function TopHubsChart({ data }: Props) {
  const reversed = [...data].reverse();
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={reversed}
        layout="vertical"
        margin={{ top: 4, right: 80, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => "৳" + (v / 1e6).toFixed(1) + "M"}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="hub"
          width={140}
          tick={{ fontSize: 11 }}
        />
        <Tooltip formatter={(v) => [formatBDT(Number(v)), "Expense"]} />
        <Bar dataKey="expense" fill="#2E75B6" radius={[0, 4, 4, 0]}>
          <LabelList
            dataKey="expense"
            position="right"
            formatter={(v) => "৳" + (Number(v) / 1e6).toFixed(1) + "M"}
            style={{ fontSize: 10, fill: "#595959" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
