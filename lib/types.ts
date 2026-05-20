export type UserRole = "client" | "staff" | "administrator";
export type UserStatus = "active" | "inactive";
export type DepositMethod = "Easypaisa" | "JazzCash" | "Crypto";
export type DepositStatus = "pending" | "approved" | "rejected";
export type WithdrawMethod = "Easypaisa" | "JazzCash";
export type WithdrawStatus = "pending" | "approved" | "rejected";
export type InvestmentPlan = "weekly" | "fifteen_days" | "monthly";
export type InvestmentStatus = "active" | "completed";
export type AccessLevel = "none" | "view" | "edit";
export type PaymentType = "Easypaisa" | "JazzCash";

export interface User {
  id: number;
  uuid: string;
  authId?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  address?: string;
  city?: string;
  withdrawAddress?: string;
  country?: string;
  timezone?: string;
  referralCode?: string;
  referredById?: number;
  balance: number;
  totalEarnings: number;
  totalDeposits: number;
  totalWithdrawals: number;
  depositCount: number;
  lastDepositMethod?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffPermission {
  id: number;
  uuid: string;
  staffId: number;
  pageKey: string;
  accessLevel: AccessLevel;
  createdAt: string;
}

export interface PaymentNumber {
  id: number;
  uuid: string;
  type: PaymentType;
  number: string;
  accountName: string;
  received: number;
  limitAmount: number;
  status: UserStatus;
  createdAt: string;
}

export interface Deposit {
  id: number;
  uuid: string;
  userId: number;
  phone: string;
  amount: number;
  method: DepositMethod;
  transactionId: string;
  senderName?: string;
  tillId?: string;
  cryptoBonus: boolean;
  bonusAmount: number;
  status: DepositStatus;
  approvedBy?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Withdrawal {
  id: number;
  uuid: string;
  userId: number;
  phone: string;
  amount: number;
  method: WithdrawMethod;
  accountNumber: string;
  status: WithdrawStatus;
  approvedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EarningsRecord {
  id: number;
  uuid: string;
  userId: number;
  investmentId?: number;
  amount: number;
  percentage: number;
  date: string;
  createdAt: string;
}

export interface Investment {
  id: number;
  uuid: string;
  userId: number;
  depositId?: number;
  amount: number;
  plan: InvestmentPlan;
  percentage: number;
  startDate: string;
  endDate: string;
  status: InvestmentStatus;
  depositCount: number;
  createdAt: string;
}

export type ReferralStatus = "pending" | "active" | "completed" | "expired";

export interface Referral {
  id: number;
  uuid: string;
  referrerId: number;
  referredId?: number;
  referredEmail?: string;
  referredName?: string;
  status: ReferralStatus;
  depositAmount: number;
  commissionEarned: number;
  commissionRate: number;
  commissionPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus = "open" | "closed";

export interface SupportTicket {
  id: number;
  uuid: string;
  userId?: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  adminReply?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "deposit_approved" | "deposit_rejected"
  | "withdrawal_approved" | "withdrawal_rejected"
  | "earnings_credit" | "investment_matured"
  | "referral_commission" | "ticket_reply" | "system";

export interface Notification {
  id: number;
  uuid: string;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface SiteSettings {
  cryptoAddresses: Record<string, string>;
  tillIds: Record<string, string>;
  pkrRate: number;
  earningRanges: Record<string, unknown>;
  bonusPercent: number;
}
