-- Business audit history and a missing foreign-key index.
-- Applied to Supabase project fouoyzmgfalyphqecpdq on 2026-10-15.

create table if not exists public.business_audit_log (
  id bigint generated always as identity primary key,
  business_id text not null default 'cornerco',
  actor_user_id uuid,
  actor_email text not null default 'system',
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  table_name text not null,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists business_audit_log_business_created_idx
  on public.business_audit_log (business_id, created_at desc);

alter table public.business_audit_log enable row level security;

drop policy if exists "CornerCo owners can view audit history" on public.business_audit_log;
create policy "CornerCo owners can view audit history"
  on public.business_audit_log
  for select to authenticated
  using (business_id = 'cornerco' and private.is_cornerco_owner());

grant select on public.business_audit_log to authenticated;

create or replace function private.capture_business_audit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private, auth
as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_business_id text;
  v_record_id text;
begin
  if TG_OP <> 'INSERT' then v_old := to_jsonb(OLD); end if;
  if TG_OP <> 'DELETE' then v_new := to_jsonb(NEW); end if;

  v_business_id := coalesce(v_new->>'business_id', v_old->>'business_id', 'cornerco');
  v_record_id := coalesce(v_new->>'id', v_old->>'id');

  insert into public.business_audit_log (
    business_id, actor_user_id, actor_email, action, table_name,
    record_id, old_data, new_data
  ) values (
    v_business_id,
    auth.uid(),
    coalesce(nullif(auth.jwt()->>'email',''), 'system'),
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    v_old,
    v_new
  );

  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

revoke all on function private.capture_business_audit() from public;
grant execute on function private.capture_business_audit() to authenticated, service_role;

drop trigger if exists business_products_audit on public.business_products;
create trigger business_products_audit after insert or update or delete on public.business_products
for each row execute function private.capture_business_audit();

drop trigger if exists business_sales_audit on public.business_sales;
create trigger business_sales_audit after insert or update or delete on public.business_sales
for each row execute function private.capture_business_audit();

drop trigger if exists business_expenses_audit on public.business_expenses;
create trigger business_expenses_audit after insert or update or delete on public.business_expenses
for each row execute function private.capture_business_audit();

drop trigger if exists business_staff_audit on public.business_staff;
create trigger business_staff_audit after insert or update or delete on public.business_staff
for each row execute function private.capture_business_audit();

drop trigger if exists business_members_audit on public.business_members;
create trigger business_members_audit after insert or update or delete on public.business_members
for each row execute function private.capture_business_audit();

drop trigger if exists business_profiles_audit on public.business_profiles;
create trigger business_profiles_audit after insert or update or delete on public.business_profiles
for each row execute function private.capture_business_audit();

create index if not exists post_targets_post_id_idx on public.post_targets(post_id);
