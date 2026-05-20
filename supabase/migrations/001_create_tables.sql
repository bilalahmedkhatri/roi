-- ============================================================
-- Run this in Supabase Studio SQL Editor
-- Creates all base tables with id+uuid pattern
-- ============================================================

-- Drop old profiles table (if exists)
drop table if exists public.profiles cascade;

-- Drop existing types if re-running
drop function if exists public.handle_new_user cascade;
drop function if exists public.generate_referral_code cascade;

-- ============================================================
-- USERS (clients + staff + administrators)
-- ============================================================
create table if not exists public.users (
  id serial primary key,
  uuid uuid not null unique default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete set null,
  name varchar(100) not null,
  email varchar(100) not null unique,
  phone varchar(20),
  password varchar(255),
  role text not null default 'client' check (role in ('client', 'staff', 'administrator')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  address text,
  city varchar(100),
  withdraw_address text,
  country varchar(100),
  timezone varchar(50),
  referral_code text unique,
  referred_by_id integer references public.users(id),
  balance numeric(16,2) not null default 0,
  total_earnings numeric(16,2) not null default 0,
  total_deposits numeric(16,2) not null default 0,
  total_withdrawals numeric(16,2) not null default 0,
  deposit_count integer not null default 0,
  last_deposit_method text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.trigger_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at before update on public.users
  for each row execute function public.trigger_set_updated_at();

-- Generate 8-char referral code
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$;

-- Auto-create user row on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  ref_code text;
  ref_by_id integer;
begin
  ref_code := public.generate_referral_code();
  ref_by_id := null;
  if new.raw_user_meta_data ->> 'ref' is not null then
    select id into ref_by_id from public.users
    where referral_code = new.raw_user_meta_data ->> 'ref';
  end if;

  insert into public.users (auth_id, email, name, phone, city, country, timezone, role, referral_code, referred_by_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'timezone',
    coalesce(new.raw_user_meta_data ->> 'role', 'client'),
    ref_code,
    ref_by_id
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = auth_id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = auth_id);

-- Indexes
create index if not exists idx_users_uuid on public.users(uuid);
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_referral_code on public.users(referral_code);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_status on public.users(status);

-- ============================================================
-- STAFF PERMISSIONS
-- ============================================================
create table if not exists public.staff_permissions (
  id serial primary key,
  uuid uuid not null unique default gen_random_uuid(),
  staff_id integer not null references public.users(id),
  page_key varchar(50) not null,
  access_level text not null default 'none' check (access_level in ('none', 'view', 'edit')),
  created_at timestamptz not null default now()
);

alter table public.staff_permissions enable row level security;

create index if not exists idx_staff_permissions_staff on public.staff_permissions(staff_id);

-- ============================================================
-- PAYMENT NUMBERS (Easypaisa / JazzCash accounts)
-- ============================================================
create table if not exists public.payment_numbers (
  id serial primary key,
  uuid uuid not null unique default gen_random_uuid(),
  type text not null check (type in ('Easypaisa', 'JazzCash')),
  number varchar(20) not null,
  account_name varchar(100) not null,
  received numeric(12,0) not null default 0,
  limit_amount numeric(12,0) not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

alter table public.payment_numbers enable row level security;

-- ============================================================
-- DEPOSITS
-- ============================================================
create table if not exists public.deposits (
  id serial primary key,
  uuid uuid not null unique default gen_random_uuid(),
  user_id integer not null references public.users(id),
  phone varchar(20) not null,
  amount numeric(12,0) not null,
  method text not null check (method in ('Easypaisa', 'JazzCash', 'Crypto')),
  transaction_id varchar(100) not null,
  sender_name varchar(100),
  till_id varchar(20),
  crypto_bonus boolean not null default false,
  bonus_amount numeric(12,0) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by integer references public.users(id),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_deposits on public.deposits;
create trigger set_updated_at_deposits before update on public.deposits
  for each row execute function public.trigger_set_updated_at();

alter table public.deposits enable row level security;

create index if not exists idx_deposits_user on public.deposits(user_id);
create index if not exists idx_deposits_status on public.deposits(status);

-- ============================================================
-- WITHDRAWALS
-- ============================================================
create table if not exists public.withdrawals (
  id serial primary key,
  uuid uuid not null unique default gen_random_uuid(),
  user_id integer not null references public.users(id),
  phone varchar(20) not null,
  amount numeric(12,0) not null,
  method text not null check (method in ('Easypaisa', 'JazzCash')),
  account_number varchar(20) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by integer references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_withdrawals on public.withdrawals;
create trigger set_updated_at_withdrawals before update on public.withdrawals
  for each row execute function public.trigger_set_updated_at();

alter table public.withdrawals enable row level security;

create index if not exists idx_withdrawals_user on public.withdrawals(user_id);
create index if not exists idx_withdrawals_status on public.withdrawals(status);

-- ============================================================
-- EARNINGS
-- ============================================================
create table if not exists public.earnings (
  id serial primary key,
  uuid uuid not null unique default gen_random_uuid(),
  user_id integer not null references public.users(id),
  investment_id integer,
  amount numeric(12,2) not null,
  percentage numeric(5,2) not null,
  date date not null,
  created_at timestamptz not null default now()
);

alter table public.earnings enable row level security;

create index if not exists idx_earnings_user on public.earnings(user_id);
create index if not exists idx_earnings_date on public.earnings(date);

-- ============================================================
-- INVESTMENTS
-- ============================================================
create table if not exists public.investments (
  id serial primary key,
  uuid uuid not null unique default gen_random_uuid(),
  user_id integer not null references public.users(id),
  deposit_id integer references public.deposits(id),
  amount numeric(12,2) not null,
  plan text not null check (plan in ('weekly', 'fifteen_days', 'monthly')),
  percentage numeric(5,2) not null,
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  deposit_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.investments enable row level security;

create index if not exists idx_investments_user on public.investments(user_id);
create index if not exists idx_investments_status on public.investments(status);

-- ============================================================
-- SITE SETTINGS (single row)
-- ============================================================
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  crypto_addresses jsonb,
  till_ids jsonb,
  pkr_rate numeric(8,2) not null default 278.5,
  earning_ranges jsonb,
  bonus_percent integer not null default 10
);

insert into public.site_settings (id, crypto_addresses, till_ids)
values (
  1,
  '{"btc": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "eth": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", "sol": "7EcDhSYGxXyscszY35KHN8vvw3svAuF9UNNQm9JQ7N"}',
  '{"easypaisa": "03001234567", "jazzcash": "03007654321"}'
)
on conflict (id) do nothing;
