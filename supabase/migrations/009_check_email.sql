-- ============================================================
-- Migration 009: Email Check RPC
-- Run AFTER 007_user_rpcs.sql
-- ============================================================

-- ============================================================
-- check_email_exists
-- Used by forgot-password flow to tell user if email is registered.
-- security definer so anon users can call it.
-- Rate limiting at the page level (Upstash 3/IP/h) mitigates enumeration.
-- ============================================================
create or replace function public.check_email_exists(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists(select 1 from public.users where email = p_email);
end;
$$;
