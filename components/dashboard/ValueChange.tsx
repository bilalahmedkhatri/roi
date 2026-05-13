export default function ValueChange({ change }: { change: string }) {
  const isPositive = !change.startsWith("-");

  return (
    <p
      className={`mt-1 text-xs font-medium ${
        isPositive ? "text-emerald-500" : "text-red-500"
      }`}
    >
      {change}
    </p>
  );
}
