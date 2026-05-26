"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { detectPakistan, formatAmount } from "@/lib/country";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import NetworkErrorBanner from "@/components/ui/NetworkErrorBanner";

const PER_PAGE = 10;

export default function TransactionsPage() {
  const isPK = detectPakistan();
  const isOnline = useOnlineStatus();
  const [page, setPage] = useState(1);
  const [txs, setTxs] = useState<any[] | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    setFetchError("");
    fetch(`/api/transactions?pageSize=${PER_PAGE}&pageNumber=${page}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setFetchError(data.error + (data.details ? ` (${data.details})` : ""));
          setTxs([]);
          return;
        }
        if (Array.isArray(data) && data.length > 0) {
          setTxs(data);
          setTotalPages(data.length < PER_PAGE ? page : page + 1);
        } else {
          setTxs([]);
        }
      })
      .catch((err) => {
        setFetchError(err.message);
        setTxs([]);
      });
  }, [page]);

  return (
    <div className="space-y-6">
      <NetworkErrorBanner />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted">All your deposits, withdrawals, and earnings</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[110px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Date</th>
                <th className="w-[90px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Type</th>
                <th className="w-[110px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Amount</th>
                <th className="w-[100px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Method</th>
                <th className="w-[90px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fetchError ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-red-400">{fetchError}</td>
                </tr>
              ) : txs === null ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted">Loading...</td>
                </tr>
              ) : txs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted">No transactions yet.</td>
                </tr>
              ) : (
                txs.map((tx: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3 text-sm text-muted">{tx.row_date}</td>
                    <td className="py-3 text-sm">{tx.row_type}</td>
                    <td className={`py-3 text-sm font-medium ${tx.row_type === "Earnings" ? "text-primary" : ""}`}>
                      {tx.row_type === "Withdrawal" ? "-" : "+"}{formatAmount(Number(tx.amount), isPK)}
                    </td>
                    <td className="py-3 text-sm text-muted">{tx.method}</td>
                    <td className="py-3"><StatusBadge status={tx.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    </div>
  );
}
