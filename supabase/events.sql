-- Creative Rank · secure event tracking for impressions, clicks and visits
-- Run after supabase/schema.sql and supabase/monthly.sql

create or replace function public.track_creative_event(
  p_entry_id uuid,
  p_event_type text,
  p_source text default null,
  p_session_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_edition_id uuid;
  v_company_id uuid;
begin
  if p_event_type not in ('impression','profile_view','ad_click','external_visit') then
    raise exception 'Tipo de evento no permitido';
  end if;

  select e.edition_id, e.company_id
    into v_edition_id, v_company_id
  from public.entries e
  join public.monthly_editions me on me.id = e.edition_id
  join public.companies c on c.id = e.company_id
  where e.id = p_entry_id
    and e.active = true
    and c.active = true
    and c.approved = true
    and me.status = 'active'
  limit 1;

  if v_edition_id is null then
    raise exception 'Participación no encontrada en la edición activa';
  end if;

  insert into public.event_log (
    edition_id, entry_id, company_id, event_type, source, session_id
  )
  values (
    v_edition_id, p_entry_id, v_company_id, p_event_type, p_source, p_session_id
  );

  -- Keep the counters used by the live ranking synchronized with the event log.
  if p_event_type = 'impression' then
    update public.entries set impressions = impressions + 1 where id = p_entry_id;
  elsif p_event_type = 'ad_click' then
    update public.entries set clicks = clicks + 1 where id = p_entry_id;
  elsif p_event_type = 'external_visit' then
    update public.entries set external_visits = external_visits + 1 where id = p_entry_id;
  end if;

  return true;
end;
$$;

grant execute on function public.track_creative_event(uuid, text, text, text) to anon, authenticated;

-- Public event tracking must not expose arbitrary writes to event_log.
drop policy if exists event_log_public_insert on public.event_log;
