"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { detectPakistan, formatAmount } from "@/lib/country";

const allEarnings = [
  { id: 1, date: "2026-05-13", amount: 43.21, plan: "Monthly", pct: 35, status: "completed" },
  { id: 2, date: "2026-05-12", amount: 38.5, plan: "Monthly", pct: 35, status: "completed" },
  { id: 3, date: "2026-05-11", amount: 41.75, plan: "Monthly", pct: 35, status: "completed" },
  { id: 4, date: "2026-05-10", amount: 36.2, plan: "Monthly", pct: 35, status: "completed" },
  { id: 5, date: "2026-05-09", amount: 39.9, plan: "15 Days", pct: 22, status: "completed" },
  { id: 6, date: "2026-05-08", amount: 42.1, plan: "Monthly", pct: 35, status: "completed" },
  { id: 7, date: "2026-05-07", amount: 37.8, plan: "15 Days", pct: 22, status: "completed" },
  { id: 8, date: "2026-05-06", amount: 40.3, plan: "Monthly", pct: 35, status: "completed" },
  { id: 9, date: "2026-05-05", amount: 35.6, plan: "Weekly", pct: 8, status: "completed" },
  { id: 10, date: "2026-05-04", amount: 44.9, plan: "Monthly", pct: 35, status: "completed" },
  { id: 11, date: "2026-05-03", amount: 33.2, plan: "Weekly", pct: 8, status: "completed" },
  { id: 12, date: "2026-05-02", amount: 41.0, plan: "15 Days", pct: 22, status: "completed" },
];

export default function EarningsPage() {
  const isPK = detectPakistan();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(allEarnings.length / rowsPerPage);

  const earnings = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return allEarnings.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Earnings
        </h1>
        <p className="text-sm text-muted">Detailed earnings history</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-surface/60">
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Rate
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {earnings.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-border transition-colors hover:bg-surface/40"
                >
                  <td className="px-6 py-4 text-sm text-muted">{e.date}</td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    {formatAmount(e.amount, isPK)}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {e.plan}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-primary">
                    +{e.pct}%
                  </td>

                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">Show</span>

            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span className="text-muted">entries</span>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <p className="text-center text-xs text-muted">
        * Earnings depend on market conditions and are not guaranteed.
      </p>
    </div>
  );
}