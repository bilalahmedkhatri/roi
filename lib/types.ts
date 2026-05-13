export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
}

export type DepositMethod = "easypaisa" | "jazzcash" | "crypto";
export type TransactionStatus = "pending" | "processing" | "completed" | "failed";
export type WithdrawMethod = "easypaisa" | "jazzcash" | "crypto";
export type InvestmentPlan = "weekly" | "fifteen_days" | "monthly";

export interface Deposit {
  id: string;
  uid: string;
  amount: number;
  method: DepositMethod;
  status: TransactionStatus;
  cryptoBonus: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Withdrawal {
  id: string;
  uid: string;
  amount: number;
  method: WithdrawMethod;
  status: TransactionStatus;
  depositId: string;
  createdAt: number;
  updatedAt: number;
}

export interface EarningsRecord {
  id: string;
  uid: string;
  amount: number;
  plan: InvestmentPlan;
  percentage: number;
  date: string;
  createdAt: number;
}

export interface Investment {
  id: string;
  uid: string;
  amount: number;
  plan: InvestmentPlan;
  percentage: number;
  startDate: number;
  endDate: number;
  status: "active" | "completed";
  depositCount: number;
  createdAt: number;
}

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export interface Transaction {
  id: string;
  uid: string;
  type: "deposit" | "withdrawal" | "earnings";
  amount: number;
  method?: string;
  status: TransactionStatus;
  description: string;
  createdAt: number;
}
