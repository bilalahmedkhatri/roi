"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { supabase } from "@/lib/supabase/client";
import { detectPakistan, formatAmount } from "@/lib/country";

const PER_PAGE = 5;

export default function TransactionsPage() {
  const isPK = detectPakistan();
  const [page, setPage] = useState(1);
  const [txs, setTxs] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.rpc("get_user_transactions", { p_page_size: PER_PAGE, p_page_number: page }).then(({ data }) => {
      if (data) {
        setTxs(data);
        setTotalPages(data.length < PER_PAGE ? page : page + 1);
      }
      setLoading(false);
    });
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted">All your deposits, withdrawals, and earnings</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[130px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Date</th>
                <th className="w-[100px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Type</th>
                <th className="w-[120px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Amount</th>
                <th className="pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Method</th>
                <th className="pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
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
