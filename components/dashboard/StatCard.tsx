interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export default function StatCard({ label, value, change, positive = true }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-4 sm:p-5">
      <p className="text-xs font-medium text-muted tracking-wide">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
      {change && (
        <p className={`mt-1 text-xs font-medium ${positive ? "text-primary" : "text-red-400"}`}>
          {positive ? "+" : ""}{change}
        </p>
      )}
    </div>
  );
}
