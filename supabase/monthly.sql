-- Creative Rank · October 2026 monthly edition + automatic enrollment
-- Run after supabase/schema.sql

insert into public.monthly_editions (code, name, starts_at, ends_at, status)
values (
  '2026-10',
  'OCTUBRE 2026',
  '2026-10-01 00:00:00-03',
  '2026-11-01 00:00:00-03',
  'active'
)
on conflict (code) do update
set name = excluded.name,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at;

-- If another edition was accidentally left active, keep October as the active edition.
update public.monthly_editions
set status = case when code = '2026-10' then 'active' else 'closed' end
where status = 'active';

-- Create the entry for every already-approved company.
insert into public.entries (edition_id, company_id)
select e.id, c.id
from public.monthly_editions e
cross join public.companies c
where e.code = '2026-10'
  and c.approved = true
  and c.active = true
on conflict (edition_id, company_id) do nothing;

-- Participant-safe helper: finds the active edition and enrolls the caller's own company.
create or replace function public.ensure_company_entry(p_company_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry_id uuid;
  v_edition_id uuid;
begin
  select id into v_edition_id
  from public.monthly_editions
  where status = 'active'
  order by starts_at desc
  limit 1;

  if v_edition_id is null then
    raise exception 'No hay una edición mensual activa';
  end if;

  if not exists (
    select 1
    from public.companies
    where id = p_company_id
      and owner_id = auth.uid()
      and approved = true
      and active = true
  ) then
    raise exception 'La empresa no pertenece al usuario autenticado o no está aprobada';
  end if;

  insert into public.entries (edition_id, company_id)
  values (v_edition_id, p_company_id)
  on conflict (edition_id, company_id)
  do update set active = true
  returning id into v_entry_id;

  return v_entry_id;
end;
$$;

grant execute on function public.ensure_company_entry(uuid) to authenticated;

-- Keep the live ranking genuinely live: score and rank are calculated from current metrics.
create or replace view public.live_ranking as
with scored as (
  select
    e.id as entry_id,
    e.edition_id,
    e.company_id,
    c.name,
    c.handle,
    c.description,
    c.logo_url,
    c.site_url,
    c.category_id,
    cat.name as category,
    e.credits,
    e.impressions,
    e.clicks,
    e.external_visits,
    case
      when e.impressions > 0
      then round((e.clicks::numeric / e.impressions::numeric) * 100, 2)
      else 0
    end as ctr,
    round(
      (e.credits::numeric / 20000) * 500
      + least(e.clicks::numeric / 2, 400)
      + least(
          case
            when e.impressions > 0
            then (e.clicks::numeric / e.impressions::numeric) * 1000
            else 0
          end,
          100
        )
    ) as computed_score,
    e.joined_at
  from public.entries e
  join public.companies c on c.id = e.company_id
  left join public.categories cat on cat.id = c.category_id
  where e.active = true
    and c.active = true
    and c.approved = true
    and e.edition_id = (
      select id
      from public.monthly_editions
      where status = 'active'
      order by starts_at desc
      limit 1
    )
)
select
  entry_id,
  edition_id,
  company_id,
  name,
  handle,
  description,
  logo_url,
  site_url,
  category_id,
  category,
  credits,
  impressions,
  clicks,
  external_visits,
  ctr,
  computed_score as score,
  row_number() over (
    order by computed_score desc, clicks desc, joined_at asc
  )::integer as rank
from scored;
