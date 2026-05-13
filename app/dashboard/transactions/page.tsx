"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { detectPakistan, formatAmount } from "@/lib/country";

const allTxs = [
  { id: 1, type: "Deposit", amount: 500, method: "Easypaisa", status: "completed", date: "2026-05-12" },
  { id: 2, type: "Earnings", amount: 43.21, method: "Monthly Plan", status: "completed", date: "2026-05-13" },
  { id: 3, type: "Deposit", amount: 250, method: "Crypto", status: "completed", date: "2026-05-10" },
  { id: 4, type: "Withdrawal", amount: 200, method: "Easypaisa", status: "processing", date: "2026-05-09" },
  { id: 5, type: "Earnings", amount: 38.5, method: "15 Days Plan", status: "completed", date: "2026-05-12" },
  { id: 6, type: "Deposit", amount: 1000, method: "JazzCash", status: "processing", date: "2026-05-13" },
  { id: 7, type: "Earnings", amount: 41.2, method: "Monthly Plan", status: "completed", date: "2026-05-11" },
  { id: 8, type: "Withdrawal", amount: 150, method: "JazzCash", status: "completed", date: "2026-05-08" },
  { id: 9, type: "Deposit", amount: 750, method: "Easypaisa", status: "completed", date: "2026-05-07" },
  { id: 10, type: "Earnings", amount: 36.8, method: "15 Days Plan", status: "completed", date: "2026-05-10" },
  { id: 11, type: "Deposit", amount: 300, method: "Crypto", status: "completed", date: "2026-05-06" },
  { id: 12, type: "Withdrawal", amount: 500, method: "Easypaisa", status: "completed", date: "2026-05-05" },
];

export default function TransactionsPage() {
  const isPK = detectPakistan();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(allTxs.length / rowsPerPage);

  const txs = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return allTxs.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-muted">
          All your deposits, withdrawals, and earnings
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-surface/60">
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Type
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  Method
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {txs.map((tx) => {
                const isEarning = tx.type === "Earnings";
                const isWithdrawal = tx.type === "Withdrawal";
                const prefix = isWithdrawal ? "-" : "+";

                return (
                  <tr
                    key={tx.id}
                    className="border-b border-border transition-colors hover:bg-surface/40"
                  >
                    <td className="px-6 py-4 text-sm text-muted">{tx.date}</td>
                    <td className="px-6 py-4 text-sm font-medium">{tx.type}</td>
                    <td
                      className={`px-6 py-4 text-right text-sm font-semibold ${isEarning
                          ? "text-primary"
                          : isWithdrawal
                            ? "text-red-500"
                            : ""
                        }`}
                    >
                      {prefix}
                      {formatAmount(tx.amount, isPK)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{tx.method}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                );
              })}
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
    </div>
  );
}