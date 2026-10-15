-- Persist daily cash-up counts and retain owner/member audit history.
create table if not exists public.business_cashups (
  id uuid primary key default gen_random_uuid(),
  business_id text not null default 'cornerco',
  business_date date not null,
  counted_cash numeric not null check (counted_cash >= 0),
  notes text not null default '',
  closed_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, business_date)
);

alter table public.business_cashups enable row level security;
drop policy if exists "CornerCo members can manage cashups" on public.business_cashups;
create policy "CornerCo members can manage cashups"
  on public.business_cashups for all to authenticated
  using (business_id = 'cornerco' and private.is_cornerco_member())
  with check (business_id = 'cornerco' and private.is_cornerco_member());
grant select, insert, update, delete on public.business_cashups to authenticated;

drop trigger if exists business_cashups_audit on public.business_cashups;
create trigger business_cashups_audit after insert or update or delete on public.business_cashups
for each row execute function private.capture_business_audit();
