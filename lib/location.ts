const COUNTRY_NAMES: Record<string, string> = {
  PK: "Pakistan",
  US: "United States",
  GB: "United Kingdom",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IN: "India",
  BD: "Bangladesh",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  SG: "Singapore",
  MY: "Malaysia",
  HK: "Hong Kong",
  TR: "Turkey",
  QA: "Qatar",
  KW: "Kuwait",
  OM: "Oman",
  BH: "Bahrain",
};

export interface LocationInfo {
  continent: string;
  countryCode: string;
  country: string;
  region: string;
  city: string;
  latitude: string;
  longitude: string;
  timezone: string;
  postalCode: string;
}

export function extractLocationFromHeaders(headers: Headers): LocationInfo {
  const countryCode = headers.get("x-vercel-ip-country") || "";
  return {
    continent: headers.get("x-vercel-ip-continent") || "",
    countryCode,
    country: COUNTRY_NAMES[countryCode] || countryCode,
    region: headers.get("x-vercel-ip-country-region") || "",
    city: headers.get("x-vercel-ip-city") || "",
    latitude: headers.get("x-vercel-ip-latitude") || "",
    longitude: headers.get("x-vercel-ip-longitude") || "",
    timezone: headers.get("x-vercel-ip-timezone") || "",
    postalCode: headers.get("x-vercel-ip-postal-code") || "",
  };
}

export function isPakistan(location: LocationInfo): boolean {
  return location.countryCode === "PK" || location.country === "Pakistan";
}
