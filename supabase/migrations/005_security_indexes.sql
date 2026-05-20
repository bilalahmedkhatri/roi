-- ============================================================
-- Migration 005: Security Indexes, Enums, Constraints
-- Run AFTER 004_audit_logs.sql
-- Safe to re-run (uses IF NOT EXISTS)
-- Order: enums → drop old checks → alter columns → new constraints → indexes
-- ============================================================

-- ============================================================
-- 1. Create Enum Types
-- ============================================================

do $$ begin
  create type user_role as enum ('client', 'staff', 'administrator');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_status as enum ('active', 'inactive');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_method as enum ('Easypaisa', 'JazzCash', 'Crypto');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type transaction_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type investment_plan as enum ('weekly', 'fifteen_days', 'monthly');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type investment_status as enum ('active', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type referral_status as enum ('pending', 'active', 'completed', 'expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type ticket_status as enum ('open', 'closed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type access_level as enum ('none', 'view', 'edit');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type notification_type as enum (
    'deposit_approved', 'deposit_rejected',
    'withdrawal_approved', 'withdrawal_rejected',
    'earnings_credit', 'investment_matured',
    'referral_commission', 'ticket_reply', 'system'
  );
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 2. Drop old CHECK constraints FIRST (before altering to enums)
--    Otherwise ALTER COLUMN TYPE conflicts with check comparing text vs enum
-- ============================================================

do $$
declare
  r record;
begin
  for r in (
    select conname, conrelid::regclass::text as tbl
    from pg_constraint
    where contype = 'c'
    and connamespace = 'public'::regnamespace
  ) loop
    begin
      execute format('alter table %I drop constraint %I', r.tbl, r.conname);
    exception when others then null;
    end;
  end loop;
end;
$$;

-- ============================================================
-- 3. Drop views that depend on columns being altered
-- ============================================================
drop view if exists public.user_transactions;

-- ============================================================
-- 4. Alter Tables to Use Enums (replacing text + check)
--    Must drop defaults first, alter type, then restore defaults
-- ============================================================

-- users
alter table public.users alter column role drop default;
alter table public.users alter column role type user_role using role::user_role;
alter table public.users alter column role set default 'client';

alter table public.users alter column status drop default;  
alter table public.users alter column status type user_status using status::user_status;
alter table public.users alter column status set default 'active';

-- staff_permissions
alter table public.staff_permissions alter column access_level drop default;
alter table public.staff_permissions alter column access_level type access_level using access_level::access_level;
alter table public.staff_permissions alter column access_level set default 'none';

-- payment_numbers
alter table public.payment_numbers alter column type type payment_method using type::payment_method;
alter table public.payment_numbers alter column status drop default;
alter table public.payment_numbers alter column status type user_status using status::user_status;
alter table public.payment_numbers alter column status set default 'active';

-- deposits
alter table public.deposits alter column method type payment_method using method::payment_method;
alter table public.deposits alter column status drop default;
alter table public.deposits alter column status type transaction_status using status::transaction_status;
alter table public.deposits alter column status set default 'pending';

-- withdrawals
alter table public.withdrawals alter column method type payment_method using method::payment_method;
alter table public.withdrawals alter column status drop default;
alter table public.withdrawals alter column status type transaction_status using status::transaction_status;
alter table public.withdrawals alter column status set default 'pending';

-- investments
alter table public.investments alter column plan type investment_plan using plan::investment_plan;
alter table public.investments alter column status drop default;
alter table public.investments alter column status type investment_status using status::investment_status;
alter table public.investments alter column status set default 'active';

-- referrals
alter table public.referrals alter column status drop default;
alter table public.referrals alter column status type referral_status using status::referral_status;
alter table public.referrals alter column status set default 'pending';

-- support_tickets
alter table public.support_tickets alter column status drop default;
alter table public.support_tickets alter column status type ticket_status using status::ticket_status;
alter table public.support_tickets alter column status set default 'open';

-- notifications
alter table public.notifications alter column type type notification_type using type::notification_type;

-- ============================================================
-- 5. New Constraints
-- ============================================================

-- positive amounts
alter table public.deposits add constraint deposits_amount_positive check (amount > 0);
alter table public.withdrawals add constraint withdrawals_amount_positive check (amount > 0);
alter table public.earnings add constraint earnings_amount_positive check (amount > 0);
alter table public.investments add constraint investments_amount_positive check (amount > 0);

-- unique transaction_id per deposit
alter table public.deposits add constraint deposits_tx_unique unique (transaction_id);

-- unique earning per investment per day
alter table public.earnings add constraint earnings_investment_date_unique unique (investment_id, date);

-- ============================================================
-- 6. Composite Indexes (performance)
-- ============================================================

-- deposits
create index if not exists idx_deposits_user_status on public.deposits(user_id, status);
create index if not exists idx_deposits_created on public.deposits(created_at desc);

-- withdrawals
create index if not exists idx_withdrawals_user_status on public.withdrawals(user_id, status);
create index if not exists idx_withdrawals_created on public.withdrawals(created_at desc);

-- earnings
create index if not exists idx_earnings_user_date on public.earnings(user_id, date desc);
create index if not exists idx_earnings_date on public.earnings(date desc);

-- investments
create index if not exists idx_investments_user_status on public.investments(user_id, status);

-- referrals
create index if not exists idx_referrals_referrer_status on public.referrals(referrer_id, status);

-- notifications
create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read) where is_read = false;

-- ============================================================
-- 7. Recreate view now that columns are enums
-- ============================================================
create view public.user_transactions as
select
  'Deposit' as type,
  amount,
  method,
  status,
  created_at::date as date,
  created_at as sort_date,
  user_id
from public.deposits
union all
select
  'Withdrawal',
  amount,
  method,
  status,
  created_at::date,
  created_at,
  user_id
from public.withdrawals
union all
select
  'Earnings',
  e.amount,
  coalesce(i.plan::text, 'System') as method,
  'completed' as status,
  e.date,
  e.date::timestamptz,
  e.user_id
from public.earnings e
left join public.investments i on e.investment_id = i.id;
