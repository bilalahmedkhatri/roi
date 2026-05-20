-- ============================================================
-- Migration 002: Referrals, Support Tickets, Notifications
-- Run this AFTER 001_create_tables.sql
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS)
-- ============================================================

-- ============================================================
-- 1. Update signup trigger to also create referral record
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  ref_code text;
  ref_by_id integer;
  new_user_id integer;
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
  )
  returning id into new_user_id;

  if ref_by_id is not null then
    insert into public.referrals (referrer_id, referred_id, referred_email, referred_name)
    values (ref_by_id, new_user_id, new.email,
      coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  end if;

  return new;
end;
$$;

-- ============================================================
-- 2. REFERRALS
-- ============================================================
create table if not exists public.referrals (
    id serial primary key,
    uuid uuid not null unique default gen_random_uuid (),
    referrer_id integer not null references public.users (id),
    referred_id integer references public.users (id),
    referred_email varchar(100),
    referred_name varchar(100),
    status text not null default 'pending' check (
        status in (
            'pending',
            'active',
            'completed',
            'expired'
        )
    ),
    deposit_amount numeric(12, 2) not null default 0,
    commission_earned numeric(12, 2) not null default 0,
    commission_rate numeric(5, 2) not null default 5.00,
    commission_paid boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_referrals on public.referrals;

create trigger set_updated_at_referrals before update on public.referrals
  for each row execute function public.trigger_set_updated_at();

alter table public.referrals enable row level security;

create index if not exists idx_referrals_referrer on public.referrals (referrer_id);

create index if not exists idx_referrals_referred on public.referrals (referred_id);

create index if not exists idx_referrals_status on public.referrals (status);

-- ============================================================
-- 3. SUPPORT TICKETS
-- ============================================================
create table if not exists public.support_tickets (
    id serial primary key,
    uuid uuid not null unique default gen_random_uuid (),
    user_id integer references public.users (id),
    name varchar(100) not null,
    email varchar(100) not null,
    subject varchar(200),
    message text not null,
    admin_reply text,
    status text not null default 'open' check (status in ('open', 'closed')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_tickets on public.support_tickets;

create trigger set_updated_at_tickets before update on public.support_tickets
  for each row execute function public.trigger_set_updated_at();

alter table public.support_tickets enable row level security;

create index if not exists idx_tickets_user on public.support_tickets (user_id);

create index if not exists idx_tickets_status on public.support_tickets (status);

-- ============================================================
-- 4. NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
    id serial primary key,
    uuid uuid not null unique default gen_random_uuid (),
    user_id integer not null references public.users (id),
    type text not null check (
        type in (
            'deposit_approved',
            'deposit_rejected',
            'withdrawal_approved',
            'withdrawal_rejected',
            'earnings_credit',
            'investment_matured',
            'referral_commission',
            'ticket_reply',
            'system'
        )
    ),
    title varchar(200) not null,
    message text not null,
    reference_type text,
    reference_id integer,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create index if not exists idx_notifications_user on public.notifications (user_id);

create index if not exists idx_notifications_unread on public.notifications (user_id, is_read)
where
    is_read = false;

create index if not exists idx_notifications_created on public.notifications (created_at desc);