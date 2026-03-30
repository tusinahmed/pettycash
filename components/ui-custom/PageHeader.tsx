import { Printer } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1A1A2E" }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: "#595959" }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ color: "#595959" }}
        >
          <Printer size={14} />
          Print
        </button>
      </div>
    </div>
  );
}
