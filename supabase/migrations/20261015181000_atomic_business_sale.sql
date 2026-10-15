-- Make a POS sale and all stock deductions one database transaction.
-- Prices, product costs and stock availability are checked in the database.
create or replace function public.complete_business_sale(
  p_staff_name text,
  p_payment_method text,
  p_items jsonb,
  p_created_at timestamptz default now()
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_item jsonb;
  v_product public.business_products%rowtype;
  v_qty numeric;
  v_unit_price numeric;
  v_unit_cost numeric;
  v_revenue numeric := 0;
  v_cogs numeric := 0;
  v_items jsonb := '[]'::jsonb;
  v_sale public.business_sales%rowtype;
  v_name text;
  v_unit text;
  v_expected_price numeric;
  v_stock_updates integer := 0;
begin
  if coalesce(trim(p_staff_name), '') = '' then
    raise exception 'Choose a staff member before completing the sale.';
  end if;
  if coalesce(trim(p_payment_method), '') = '' then
    raise exception 'Choose a payment method before completing the sale.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Add at least one item to the sale.';
  end if;
  if not exists (
    select 1 from public.business_staff s
    where s.business_id = 'cornerco' and s.active = true and s.name = trim(p_staff_name)
  ) then
    raise exception 'The selected staff member is not active in this business.';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_qty := nullif(v_item->>'quantity', '')::numeric;
    if v_qty is null or v_qty <= 0 or v_qty::text in ('NaN', 'Infinity', '-Infinity') then
      raise exception 'Every sale item must have a valid quantity greater than zero.';
    end if;

    v_unit := coalesce(v_item->>'unit', 'units');

    if coalesce((v_item->>'stock_tracked')::boolean, false) then
      if nullif(v_item->>'product_id', '') is null then
        raise exception 'A stock-tracked item is missing its product reference.';
      end if;

      select * into v_product
      from public.business_products p
      where p.id = (v_item->>'product_id')::uuid
        and p.business_id = 'cornerco'
        and p.active = true
      for update;

      if not found then
        raise exception 'A product in this sale is no longer available.';
      end if;
      if v_product.stock < v_qty then
        raise exception 'Not enough stock for %. Available: %.', v_product.name, v_product.stock;
      end if;

      v_unit_price := case
        when v_product.bulk_min_qty is not null
          and v_product.bulk_price is not null
          and v_qty >= v_product.bulk_min_qty then v_product.bulk_price
        else v_product.price
      end;
      v_unit_cost := v_product.unit_cost;

      update public.business_products
      set stock = stock - v_qty
      where id = v_product.id and business_id = 'cornerco';
      v_stock_updates := v_stock_updates + 1;
      v_name := v_product.name;
    else
      v_name := trim(coalesce(v_item->>'name', ''));
      v_unit_cost := 0;
      if v_name = 'Water refill' and v_unit = 'litres' then
        v_expected_price := 1;
      elsif v_name = '1.5L prefilled water' then
        v_expected_price := 12;
      elsif v_name = '5L prefilled water' then
        v_expected_price := 20;
      elsif v_name = '10L prefilled water' then
        v_expected_price := 38;
      elsif v_name = 'Ice' then
        v_expected_price := 15;
      else
        raise exception 'This untracked item is not recognised. Refresh the workspace and try again.';
      end if;
      v_unit_price := v_expected_price;
    end if;

    v_revenue := v_revenue + (v_qty * v_unit_price);
    v_cogs := v_cogs + (v_qty * v_unit_cost);
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'product_id', case when coalesce((v_item->>'stock_tracked')::boolean, false) then v_product.id else null end,
      'stock_tracked', coalesce((v_item->>'stock_tracked')::boolean, false),
      'name', v_name,
      'quantity', v_qty,
      'unit', v_unit,
      'price', v_unit_price,
      'unit_cost', v_unit_cost
    ));
  end loop;

  insert into public.business_sales (
    business_id, staff_name, payment_method, items, revenue, cogs, created_at, status
  ) values (
    'cornerco', trim(p_staff_name), trim(p_payment_method), v_items, v_revenue, v_cogs,
    coalesce(p_created_at, now()), 'completed'
  )
  returning * into v_sale;

  return jsonb_build_object(
    'id', v_sale.id,
    'revenue', v_sale.revenue,
    'cogs', v_sale.cogs,
    'created_at', v_sale.created_at,
    'stock_items_updated', v_stock_updates
  );
end;
$$;

revoke all on function public.complete_business_sale(text, text, jsonb, timestamptz) from public;
grant execute on function public.complete_business_sale(text, text, jsonb, timestamptz) to authenticated;
