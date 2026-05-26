import { NextResponse } from "next/server";
import { extractLocationFromHeaders } from "@/lib/location";

export async function GET(request: Request) {
  const location = extractLocationFromHeaders(new Headers(request.headers));

  return NextResponse.json({
    continent: location.continent,
    countryCode: location.countryCode,
    country: location.country,
    region: location.region,
    city: location.city,
    timezone: location.timezone,
  });
}
