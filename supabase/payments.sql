-- Creative Rank · atomic payment credit allocation
-- Run after schema.sql

create or replace function public.approve_credit_purchase(
  p_purchase_id uuid,
  p_provider_payment_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase public.credit_purchases%rowtype;
  v_entry public.entries%rowtype;
  v_new_balance integer;
begin
  select * into v_purchase
  from public.credit_purchases
  where id = p_purchase_id
  for update;

  if not found then return false; end if;
  if v_purchase.status = 'approved' then return true; end if;

  select * into v_entry
  from public.entries
  where company_id = v_purchase.company_id
    and edition_id = v_purchase.edition_id
    and active = true
  for update;

  if not found then
    update public.credit_purchases
    set status='cancelled', provider_payment_id=p_provider_payment_id
    where id=p_purchase_id;
    return false;
  end if;

  v_new_balance := v_entry.credits + v_purchase.credits;
  if v_new_balance > 20000 then
    update public.credit_purchases
    set status='cancelled', provider_payment_id=p_provider_payment_id
    where id=p_purchase_id;
    return false;
  end if;

  update public.entries set credits=v_new_balance where id=v_entry.id;

  insert into public.credit_movements(
    company_id, edition_id, purchase_id, movement_type, amount, balance_after, note
  ) values (
    v_purchase.company_id, v_purchase.edition_id, v_purchase.id,
    'purchase', v_purchase.credits, v_new_balance,
    'Mercado Pago ' || p_provider_payment_id
  );

  update public.credit_purchases
  set status='approved',
      provider_payment_id=p_provider_payment_id,
      approved_at=now()
  where id=p_purchase_id;

  return true;
end;
$$;

grant execute on function public.approve_credit_purchase(uuid,text) to service_role;
