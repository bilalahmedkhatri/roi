-- ============================================================
-- Migration 004: Audit Logs
-- Run AFTER 003_security_indexes.sql
-- ============================================================

-- ============================================================
-- 1. Audit Logs Table
-- ============================================================
create table if not exists public.audit_logs (
  id serial primary key,
  uuid uuid not null unique default gen_random_uuid(),
  user_id integer references public.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id integer,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create index if not exists idx_audit_logs_user on public.audit_logs(user_id, created_at desc);
create index if not exists idx_audit_logs_action on public.audit_logs(action, created_at desc);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);

-- ============================================================
-- 2. Helper Function: log an audit event
-- Called from inside RPCs, so no RLS issue (security definer)
-- ============================================================
create or replace function public.log_audit(
  p_user_id integer,
  p_action text,
  p_entity_type text default null,
  p_entity_id integer default null,
  p_metadata jsonb default '{}'::jsonb,
  p_ip_address text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
  values (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata, p_ip_address);
end;
$$;

revoke all on function public.log_audit(integer, text, text, integer, jsonb, text) from public;
grant execute on function public.log_audit(integer, text, text, integer, jsonb, text) to authenticated;
