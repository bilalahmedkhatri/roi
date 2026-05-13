export const SITE_NAME = "ROI AI Trading";
export const SITE_DESCRIPTION =
  "AI-powered automated trading platform with real-time earnings dashboard.";
export const SITE_URL = "https://roiaitrading.com";

export const MIN_DEPOSIT_PKR = 1500;
export const MIN_DEPOSIT_USD = 5;
export const MIN_CRYPTO_DEPOSIT_USD = 25;
export const CRYPTO_BONUS_PERCENTAGE = 10;

export const PLAN_LABELS = {
  weekly: "Weekly Plan",
  fifteen_days: "15 Days Plan",
  monthly: "Monthly Plan",
} as const;

export const PLAN_DURATIONS = {
  weekly: 7,
  fifteen_days: 15,
  monthly: 30,
} as const;

export const EARNING_RANGES = {
  new_user: { min: 20, max: 50 },
  experienced: {
    monthly: { min: 20, max: 30 },
    fifteen_days: { min: 10, max: 18 },
    weekly: { min: 3, max: 7 },
  },
  veteran: {
    monthly: 40,
    fifteen_days: 25,
    weekly: 7,
  },
} as const;

export const TIMEZONE = "America/New_York";

export const DEPOSIT_PROCESSING_MINUTES = { min: 2, max: 5 };
export const WITHDRAW_PROCESSING_HOURS = { min: 2, max: 12 };
