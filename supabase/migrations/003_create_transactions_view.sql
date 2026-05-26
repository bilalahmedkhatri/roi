-- ============================================================
-- Migration 003: Transactions UNION View
-- Run this AFTER 001_create_tables.sql and 002_create_extra_tables.sql
-- ============================================================
drop view if exists public.user_transactions;

create view public.user_transactions as
select
  'Deposit'::text as type,
  amount,
  method::text,
  status::text,
  created_at::date as date,
  created_at as sort_date,
  user_id
from public.deposits
union all
select
  'Withdrawal'::text,
  amount,
  method::text,
  status::text,
  created_at::date,
  created_at,
  user_id
from public.withdrawals
union all
select
  'Earnings'::text,
  e.amount,
  coalesce(i.plan::text, 'System') as method,
  'completed' as status,
  e.date,
  e.date::timestamptz,
  e.user_id
from public.earnings e
left join public.investments i on e.investment_id = i.id;