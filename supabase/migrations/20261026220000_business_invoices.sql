-- NelaPost Business invoicing
alter table public.business_profiles
  add column if not exists vat_registered boolean not null default false,
  add column if not exists vat_rate numeric(5,2) not null default 15,
  add column if not exists payment_details text not null default '';

create table if not exists public.business_invoices (
  id uuid primary key default gen_random_uuid(),
  business_id text not null default 'cornerco',
  invoice_number text not null,
  customer_name text not null,
  customer_email text not null default '',
  customer_address text not null default '',
  issue_date date not null default current_date,
  due_date date not null,
  currency text not null default 'ZAR',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  vat_registered boolean not null default false,
  vat_rate numeric(5,2) not null default 15,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft','sent','partially_paid','paid','overdue','void')),
  notes text not null default '',
  payment_details text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, invoice_number)
);

create index if not exists business_invoices_business_created_idx
  on public.business_invoices (business_id, created_at desc);

alter table public.business_invoices enable row level security;

drop policy if exists "Authenticated users can view NelaPost business invoices" on public.business_invoices;
create policy "Authenticated users can view NelaPost business invoices"
  on public.business_invoices for select to authenticated using (business_id = 'cornerco');

drop policy if exists "Authenticated users can create NelaPost business invoices" on public.business_invoices;
create policy "Authenticated users can create NelaPost business invoices"
  on public.business_invoices for insert to authenticated with check (business_id = 'cornerco' and (created_by is null or created_by = auth.uid()));

drop policy if exists "Authenticated users can update NelaPost business invoices" on public.business_invoices;
create policy "Authenticated users can update NelaPost business invoices"
  on public.business_invoices for update to authenticated using (business_id = 'cornerco') with check (business_id = 'cornerco');

drop policy if exists "Authenticated users can delete NelaPost business invoices" on public.business_invoices;
create policy "Authenticated users can delete NelaPost business invoices"
  on public.business_invoices for delete to authenticated using (business_id = 'cornerco');
