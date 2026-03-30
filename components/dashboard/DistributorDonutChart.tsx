"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatBDT } from "@/lib/utils";

const COLORS = [
  "#2E75B6","#1F3864","#70AD47","#FFC000","#ED7D31",
  "#BDD7EE","#C00000","#595959","#DEEAF1",
];

interface Props {
  data: { name: string; value: number }[];
}

export default function DistributorDonutChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="40%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            `${formatBDT(Number(value))} (${((Number(value) / total) * 100).toFixed(1)}%)`,
            name,
          ]}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11, color: "#595959" }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
