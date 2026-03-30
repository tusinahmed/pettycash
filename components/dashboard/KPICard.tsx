import { Card } from "@/components/ui/card";

interface Props {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}

export default function KPICard({ label, value, sub, icon }: Props) {
  return (
    <Card
      className="p-4 relative overflow-hidden border-0 shadow-sm"
      style={{ backgroundColor: "#fff", borderTop: "3px solid #2E75B6" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#595959" }}>
            {label}
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: "#1A1A2E" }}>
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-1" style={{ color: "#595959" }}>
              {sub}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: "#DEEAF1" }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
