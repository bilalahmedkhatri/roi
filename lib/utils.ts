export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function formatDateShort(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2);
}

export function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

export function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    weekly: "Weekly Plan",
    fifteen_days: "15 Days Plan",
    monthly: "Monthly Plan",
  };
  return labels[plan] || plan;
}

export function getPlanDuration(plan: string): number {
  const durations: Record<string, number> = {
    weekly: 7,
    fifteen_days: 15,
    monthly: 30,
  };
  return durations[plan] || 30;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
    processing: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
    completed: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    failed: "text-red-500 bg-red-50 dark:bg-red-950/30",
    active: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  };
  return colors[status] || "text-zinc-500 bg-zinc-50 dark:bg-zinc-950/30";
}
