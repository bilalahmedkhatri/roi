-- ============================================================
-- Migration 005: User-Facing RPCs
-- Run AFTER 004_audit_logs.sql
-- All functions: security definer, auth check, uid lookup
-- ============================================================

-- ============================================================
-- 1. get_dashboard_summary
-- Returns: balance, today_earnings, total_earnings, active_investments, has_pending_deposit
-- ============================================================
create or replace function public.get_dashboard_summary()
returns table (
  balance numeric,
  today_earnings numeric,
  total_earnings numeric,
  active_investments bigint,
  has_pending_deposit boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id into uid from public.users where auth_id = auth.uid();
  if uid is null then raise exception 'User not found'; end if;

  return query
  select
    u.balance,
    coalesce(sum(case when e.date = current_date then e.amount else 0 end), 0)::numeric as today_earnings,
    u.total_earnings,
    (select count(*) from public.investments i where i.user_id = uid and i.status = 'active') as active_investments,
    (select exists (select 1 from public.deposits d where d.user_id = uid and d.status = 'pending')) as has_pending_deposit
  from public.users u
  left join public.earnings e on e.user_id = uid
  where u.id = uid
  group by u.balance, u.total_earnings;
end;
$$;

revoke all on function public.get_dashboard_summary() from public;
grant execute on function public.get_dashboard_summary() to authenticated;

-- ============================================================
-- 2. get_user_transactions
-- Paginated UNION of deposits, withdrawals, earnings
-- ============================================================
create or replace function public.get_user_transactions(
  p_page_size int default 5,
  p_page_number int default 1
)
returns table (
  row_type text,
  amount numeric,
  method text,
  status text,
  row_date date,
  sort_date timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_page_size < 1 or p_page_size > 50 then
    p_page_size := 5;
  end if;
  if p_page_number < 1 then
    p_page_number := 1;
  end if;

  select id into uid from public.users where auth_id = auth.uid();
  if uid is null then raise exception 'User not found'; end if;

  return query
  select * from (
    select
      'Deposit'::text,
      d.amount::numeric,
      d.method::text,
      d.status::text,
      d.created_at::date,
      d.created_at::timestamptz
    from public.deposits d where d.user_id = uid

    union all

    select
      'Withdrawal',
      w.amount,
      w.method,
      w.status,
      w.created_at::date,
      w.created_at
    from public.withdrawals w where w.user_id = uid

    union all

    select
      'Earnings',
      e.amount,
      coalesce(i.plan::text, 'System'),
      'completed',
      e.date,
      e.date::timestamptz
    from public.earnings e
    left join public.investments i on e.investment_id = i.id
    where e.user_id = uid
  ) t
  order by sort_date desc, row_type asc
  limit p_page_size
  offset (p_page_number - 1) * p_page_size;
end;
$$;

revoke all on function public.get_user_transactions(int, int) from public;
grant execute on function public.get_user_transactions(int, int) to authenticated;

-- ============================================================
-- 3. get_earnings
-- Paginated earnings list with plan name
-- ============================================================
create or replace function public.get_earnings(
  p_page_size int default 5,
  p_page_number int default 1
)
returns table (
  id integer,
  amount numeric,
  percentage numeric,
  earning_date date,
  plan text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_page_size < 1 or p_page_size > 50 then
    p_page_size := 5;
  end if;
  if p_page_number < 1 then
    p_page_number := 1;
  end if;

  select id into uid from public.users where auth_id = auth.uid();
  if uid is null then raise exception 'User not found'; end if;

  return query
  select
    e.id,
    e.amount,
    e.percentage,
    e.date,
    coalesce(i.plan::text, 'System') as plan
  from public.earnings e
  left join public.investments i on e.investment_id = i.id
  where e.user_id = uid
  order by e.date desc, e.id desc
  limit p_page_size
  offset (p_page_number - 1) * p_page_size;
end;
$$;

revoke all on function public.get_earnings(int, int) from public;
grant execute on function public.get_earnings(int, int) to authenticated;

-- ============================================================
-- 4. submit_deposit
-- Creates a pending deposit (does NOT credit balance)
-- Validates: amount, method, max 3 pending, no duplicate tx_id
-- ============================================================
create or replace function public.submit_deposit(
  p_amount numeric,
  p_method text,
  p_transaction_id text,
  p_sender_name text default null,
  p_sender_number text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid integer;
  pending_count integer;
  settings record;
  bonus numeric := 0;
  till_id text;
  new_deposit_id integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id into uid from public.users where auth_id = auth.uid();
  if uid is null then raise exception 'User not found'; end if;

  -- validate amount
  if p_amount <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;

  -- validate method
  if p_method not in ('Easypaisa', 'JazzCash', 'Crypto') then
    raise exception 'Invalid payment method';
  end if;

  -- max 3 pending deposits
  select count(*) into pending_count
  from public.deposits where user_id = uid and status = 'pending';
  if pending_count >= 3 then
    raise exception 'Too many pending deposits. Complete or wait for existing ones.';
  end if;

  -- load site settings for bonus + till_id
  select crypto_addresses, till_ids, bonus_percent into settings
  from public.site_settings where id = 1;

  -- crypto bonus
  if p_method = 'Crypto' and p_amount >= 25 then
    bonus := p_amount * (settings.bonus_percent::numeric / 100);
  end if;

  -- till ID for Easypaisa/JazzCash
  till_id := settings.till_ids ->> lower(p_method);

  -- insert deposit
  insert into public.deposits (user_id, phone, amount, method, transaction_id, sender_name, sender_number, till_id, crypto_bonus, bonus_amount, status)
  values (
    uid,
    (select phone from public.users where id = uid),
    p_amount,
    p_method::payment_method,
    p_transaction_id,
    p_sender_name,
    p_sender_number,
    till_id,
    (p_method = 'Crypto' and p_amount >= 25),
    bonus,
    'pending'
  )
  returning id into new_deposit_id;

  -- audit log
  perform public.log_audit(uid, 'deposit_submitted', 'deposit', new_deposit_id,
    jsonb_build_object('amount', p_amount, 'method', p_method, 'bonus', bonus));

  return jsonb_build_object('success', true, 'deposit_id', new_deposit_id, 'bonus', bonus);
end;
$$;

revoke all on function public.submit_deposit(numeric, text, text, text, text) from public;
grant execute on function public.submit_deposit(numeric, text, text, text, text) to authenticated;

-- ============================================================
-- 5. submit_withdrawal
-- Row-locks user, deducts balance, creates pending withdrawal
-- Validates: amount > 0, balance >= amount, no other pending withdrawal
-- ============================================================
create or replace function public.submit_withdrawal(
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid integer;
  user_row record;
  new_withdrawal_id integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id into uid from public.users where auth_id = auth.uid();
  if uid is null then raise exception 'User not found'; end if;

  -- validate amount
  if p_amount <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;

  -- lock user row and get current state
  select id, balance, last_deposit_method, phone, withdraw_address
  into user_row
  from public.users
  where id = uid
  for update;

  -- check last deposit method
  if user_row.last_deposit_method is null then
    raise exception 'No deposit history found. Make a deposit first.';
  end if;

  -- check balance
  if user_row.balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  -- check no pending withdrawal
  if exists (select 1 from public.withdrawals where user_id = uid and status = 'pending') then
    raise exception 'A withdrawal is already pending';
  end if;

  -- deduct balance
  update public.users
  set balance = balance - p_amount,
      total_withdrawals = total_withdrawals + p_amount
  where id = uid;

  -- insert withdrawal
  insert into public.withdrawals (user_id, phone, amount, method, account_number, status)
  values (
    uid,
    user_row.phone,
    p_amount,
    user_row.last_deposit_method::payment_method,
    case when user_row.last_deposit_method = 'Crypto' then user_row.withdraw_address else user_row.phone end,
    'pending'
  )
  returning id into new_withdrawal_id;

  -- audit log
  perform public.log_audit(uid, 'withdrawal_submitted', 'withdrawal', new_withdrawal_id,
    jsonb_build_object('amount', p_amount, 'method', user_row.last_deposit_method));

  return jsonb_build_object('success', true, 'withdrawal_id', new_withdrawal_id);
end;
$$;

revoke all on function public.submit_withdrawal(numeric) from public;
grant execute on function public.submit_withdrawal(numeric) to authenticated;

-- ============================================================
-- 6. get_site_settings
-- Returns public platform settings
-- ============================================================
create or replace function public.get_site_settings()
returns table (
  crypto_addresses jsonb,
  till_ids jsonb,
  bonus_percent integer,
  pkr_rate numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select s.crypto_addresses, s.till_ids, s.bonus_percent, s.pkr_rate
  from public.site_settings s
  where s.id = 1;
end;
$$;

revoke all on function public.get_site_settings() from public;
grant execute on function public.get_site_settings() to authenticated;

-- ============================================================
-- 7. get_referral_stats
-- Returns referral code + aggregate stats
-- ============================================================
create or replace function public.get_referral_stats()
returns table (
  referral_code text,
  total_referred bigint,
  active_referred bigint,
  total_deposits numeric,
  commission_earned numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id into uid from public.users where auth_id = auth.uid();
  if uid is null then raise exception 'User not found'; end if;

  return query
  select
    u.referral_code,
    count(r.id)::bigint,
    count(r.id) filter (where r.status in ('active', 'completed'))::bigint,
    coalesce(sum(r.deposit_amount), 0),
    coalesce(sum(r.commission_earned), 0)
  from public.users u
  left join public.referrals r on r.referrer_id = u.id
  where u.id = uid
  group by u.referral_code;
end;
$$;

revoke all on function public.get_referral_stats() from public;
grant execute on function public.get_referral_stats() to authenticated;

-- ============================================================
-- 8. get_referral_list
-- Returns individual referral records
-- ============================================================
create or replace function public.get_referral_list()
returns table (
  id integer,
  referred_name text,
  referred_email text,
  deposit_amount numeric,
  status text,
  joined date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id into uid from public.users where auth_id = auth.uid();
  if uid is null then raise exception 'User not found'; end if;

  return query
  select
    r.id,
    coalesce(u.name, r.referred_name) as referred_name,
    coalesce(u.email, r.referred_email) as referred_email,
    r.deposit_amount,
    r.status::text,
    r.created_at::date
  from public.referrals r
  left join public.users u on u.id = r.referred_id
  where r.referrer_id = uid
  order by r.created_at desc;
end;
$$;

revoke all on function public.get_referral_list() from public;
grant execute on function public.get_referral_list() to authenticated;
