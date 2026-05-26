import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const p_page_size = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "5"), 1), 50);
  const p_page_number = Math.max(parseInt(searchParams.get("pageNumber") || "1"), 1);

  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("get_earnings", {
    p_page_size,
    p_page_number,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data ?? []);
}
