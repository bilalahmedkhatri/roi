"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { supabase } from "@/lib/supabase/client";
import { detectPakistan, formatAmount } from "@/lib/country";

const PER_PAGE = 5;

export default function EarningsPage() {
  const isPK = detectPakistan();
  const [page, setPage] = useState(1);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.rpc("get_earnings", { p_page_size: PER_PAGE, p_page_number: page }).then(({ data }) => {
      if (data) {
        setEarnings(data);
        setTotalPages(data.length < PER_PAGE ? page : page + 1);
      }
      setLoading(false);
    });
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
        <p className="text-sm text-muted">Detailed earnings history</p>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[140px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Date</th>
                <th className="w-[120px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Amount</th>
                <th className="w-[120px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Plan</th>
                <th className="w-[80px] pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Rate</th>
                <th className="pb-3 text-left font-medium text-muted text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted">Loading...</td>
                </tr>
              ) : earnings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted">No earnings yet.</td>
                </tr>
              ) : (
                earnings.map((e: any) => (
                  <tr key={e.id}>
                    <td className="py-3 text-sm text-muted">{e.earning_date}</td>
                    <td className="py-3 text-sm font-medium">{formatAmount(Number(e.amount), isPK)}</td>
                    <td className="py-3 text-sm">{e.plan}</td>
                    <td className="py-3 text-sm text-primary">+{e.percentage}%</td>
                    <td className="py-3"><StatusBadge status="completed" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
      <p className="text-center text-xs text-muted">* Earnings depend on market conditions and are not guaranteed.</p>
    </div>
  );
}
