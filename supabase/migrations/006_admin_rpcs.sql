-- ============================================================
-- Migration 006: Admin RPCs
-- Run AFTER 005_user_rpcs.sql
-- All functions check users.role = 'administrator'
-- ============================================================

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
begin
  if auth.uid() is null then return false; end if;
  select role::text into user_role from public.users where auth_id = auth.uid();
  return user_role = 'administrator';
end;
$$;

-- ============================================================
-- 1. admin_approve_deposit
-- Credits user balance, creates investment, logs audit
-- ============================================================
create or replace function public.admin_approve_deposit(p_deposit_id integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  deposit_record record;
  plan_type investment_plan;
  plan_duration int;
  user_deposit_count int;
  rate numeric;
  admin_id integer;
begin
  if not public.is_admin() then raise exception 'Forbidden'; end if;

  select id into admin_id from public.users where auth_id = auth.uid();

  -- get deposit
  select * into deposit_record from public.deposits where id = p_deposit_id;
  if not found then raise exception 'Deposit not found'; end if;
  if deposit_record.status != 'pending' then raise exception 'Deposit is not pending'; end if;

  -- get user's deposit count
  select deposit_count into user_deposit_count
  from public.users where id = deposit_record.user_id;

  -- determine plan and rate based on deposit count
  if user_deposit_count >= 5 then
    plan_type := 'monthly';
    rate := 40;
  elsif user_deposit_count >= 2 then
    plan_type := 'monthly';
    rate := 25;
  else
    plan_type := 'weekly';
    rate := 8;
  end if;

  plan_duration := case plan_type
    when 'weekly' then 7
    when 'fifteen_days' then 15
    when 'monthly' then 30
  end;

  -- credit balance + bonus
  update public.users
  set balance = balance + deposit_record.amount + deposit_record.bonus_amount,
      total_deposits = total_deposits + deposit_record.amount,
      deposit_count = deposit_count + 1,
      last_deposit_method = deposit_record.method::text,
      updated_at = now()
  where id = deposit_record.user_id;

  -- mark deposit approved
  update public.deposits
  set status = 'approved', approved_by = admin_id, updated_at = now()
  where id = p_deposit_id;

  -- create investment
  insert into public.investments (user_id, deposit_id, amount, plan, percentage, start_date, end_date, status, deposit_count)
  values (
    deposit_record.user_id, p_deposit_id, deposit_record.amount + deposit_record.bonus_amount,
    plan_type, rate, now(), now() + (plan_duration || ' days')::interval,
    'active', user_deposit_count + 1
  );

  -- audit log
  perform public.log_audit(admin_id, 'deposit_approved', 'deposit', p_deposit_id,
    jsonb_build_object('user_id', deposit_record.user_id, 'amount', deposit_record.amount, 'bonus', deposit_record.bonus_amount, 'rate', rate, 'plan', plan_type));

  return jsonb_build_object('success', true, 'message', 'Deposit approved and investment created');
end;
$$;

revoke all on function public.admin_approve_deposit(integer) from public;
grant execute on function public.admin_approve_deposit(integer) to authenticated;

-- ============================================================
-- 2. admin_reject_deposit
-- ============================================================
create or replace function public.admin_reject_deposit(p_deposit_id integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_id integer;
begin
  if not public.is_admin() then raise exception 'Forbidden'; end if;

  select id into admin_id from public.users where auth_id = auth.uid();

  if not exists (select 1 from public.deposits where id = p_deposit_id and status = 'pending') then
    raise exception 'Deposit not found or already processed';
  end if;

  update public.deposits set status = 'rejected', approved_by = admin_id, updated_at = now()
  where id = p_deposit_id;

  perform public.log_audit(admin_id, 'deposit_rejected', 'deposit', p_deposit_id);
  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.admin_reject_deposit(integer) from public;
grant execute on function public.admin_reject_deposit(integer) to authenticated;

-- ============================================================
-- 3. admin_approve_withdrawal
-- ============================================================
create or replace function public.admin_approve_withdrawal(p_withdrawal_id integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_id integer;
begin
  if not public.is_admin() then raise exception 'Forbidden'; end if;

  select id into admin_id from public.users where auth_id = auth.uid();

  if not exists (select 1 from public.withdrawals where id = p_withdrawal_id and status = 'pending') then
    raise exception 'Withdrawal not found or already processed';
  end if;

  update public.withdrawals set status = 'approved', approved_by = admin_id, updated_at = now()
  where id = p_withdrawal_id;

  perform public.log_audit(admin_id, 'withdrawal_approved', 'withdrawal', p_withdrawal_id);
  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.admin_approve_withdrawal(integer) from public;
grant execute on function public.admin_approve_withdrawal(integer) to authenticated;

-- ============================================================
-- 4. admin_reject_withdrawal
-- Refunds balance to user
-- ============================================================
create or replace function public.admin_reject_withdrawal(p_withdrawal_id integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_id integer;
  withdrawal_record record;
begin
  if not public.is_admin() then raise exception 'Forbidden'; end if;

  select id into admin_id from public.users where auth_id = auth.uid();

  select * into withdrawal_record from public.withdrawals where id = p_withdrawal_id and status = 'pending';
  if not found then raise exception 'Withdrawal not found or already processed'; end if;

  -- refund balance
  update public.users
  set balance = balance + withdrawal_record.amount,
      total_withdrawals = total_withdrawals - withdrawal_record.amount
  where id = withdrawal_record.user_id;

  -- mark rejected
  update public.withdrawals set status = 'rejected', approved_by = admin_id, updated_at = now()
  where id = p_withdrawal_id;

  perform public.log_audit(admin_id, 'withdrawal_rejected', 'withdrawal', p_withdrawal_id,
    jsonb_build_object('refund', withdrawal_record.amount, 'user_id', withdrawal_record.user_id));
  return jsonb_build_object('success', true);
end;
$$;

revoke all on function public.admin_reject_withdrawal(integer) from public;
grant execute on function public.admin_reject_withdrawal(integer) to authenticated;

-- ============================================================
-- 5. admin_get_pending_deposits
-- ============================================================
create or replace function public.admin_get_pending_deposits()
returns table (
  id integer,
  user_id integer,
  user_name text,
  amount numeric,
  method text,
  transaction_id text,
  sender_name text,
  sender_number text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Forbidden'; end if;

  return query
  select d.id, d.user_id, u.name::text, d.amount, d.method::text, d.transaction_id,
         d.sender_name, d.sender_number, d.created_at
  from public.deposits d
  join public.users u on u.id = d.user_id
  where d.status = 'pending'
  order by d.created_at asc;
end;
$$;

revoke all on function public.admin_get_pending_deposits() from public;
grant execute on function public.admin_get_pending_deposits() to authenticated;

-- ============================================================
-- 6. admin_get_pending_withdrawals
-- ============================================================
create or replace function public.admin_get_pending_withdrawals()
returns table (
  id integer,
  user_id integer,
  user_name text,
  amount numeric,
  method text,
  account_number text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Forbidden'; end if;

  return query
  select w.id, w.user_id, u.name::text, w.amount, w.method::text, w.account_number, w.created_at
  from public.withdrawals w
  join public.users u on u.id = w.user_id
  where w.status = 'pending'
  order by w.created_at asc;
end;
$$;

revoke all on function public.admin_get_pending_withdrawals() from public;
grant execute on function public.admin_get_pending_withdrawals() to authenticated;
