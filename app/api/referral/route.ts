import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await supabaseServer();

  const [statsRes, listRes] = await Promise.all([
    supabase.rpc("get_referral_stats").single(),
    supabase.rpc("get_referral_list"),
  ]);

  if (statsRes.error) {
    return NextResponse.json({ error: statsRes.error.message }, { status: 400 });
  }

  return NextResponse.json({
    stats: statsRes.data ?? null,
    referrals: listRes.data ?? [],
  });
}
