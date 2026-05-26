import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "5") || 5, 1), 50);
    const pageNumber = Math.max(parseInt(searchParams.get("pageNumber") || "1") || 1, 1);

    const supabase = await supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc("get_user_transactions", {
      p_page_size: pageSize,
      p_page_number: pageNumber,
      p_days: 99999,
    });

    if (error) {
      return NextResponse.json({ error: error.message, hint: error.hint, details: error.details }, { status: 400 });
    }

    if (!data || !Array.isArray(data)) {
      return NextResponse.json([]);
    }

    const sorted = [...data].sort((a: any, b: any) => {
      const diff = new Date(b.sort_date).getTime() - new Date(a.sort_date).getTime();
      if (diff !== 0) return diff;
      const order: Record<string, number> = { Deposit: 0, Earnings: 1, Withdrawal: 2 };
      return (order[a.row_type] ?? 1) - (order[b.row_type] ?? 1);
    });

    return NextResponse.json(sorted);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}
