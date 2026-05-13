interface StatusBadgeProps {
  status: string;
}

const styles: Record<string, string> = {
  completed: "bg-primary/10 text-primary border-primary/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  active: "bg-primary/10 text-primary border-primary/20",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
