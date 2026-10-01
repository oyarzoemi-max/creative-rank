-- Creative Rank · MVP database foundation
-- Run this script in Supabase SQL Editor.
-- It is designed for monthly editions, promotional credits and auditable events.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'participant' check (role in ('participant','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  handle text,
  category_id uuid references public.categories(id) on delete set null,
  description text not null check (char_length(description) between 1 and 120),
  logo_url text,
  site_url text,
  accent text,
  approved boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists companies_handle_unique
  on public.companies(handle)
  where handle is not null;

create table if not exists public.monthly_editions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft','active','closed')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create unique index if not exists one_active_edition
  on public.monthly_editions(status)
  where status = 'active';

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.monthly_editions(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  credits integer not null default 0 check (credits >= 0 and credits <= 20000),
  impressions bigint not null default 0 check (impressions >= 0),
  clicks bigint not null default 0 check (clicks >= 0),
  external_visits bigint not null default 0 check (external_visits >= 0),
  score numeric(12,2) not null default 0,
  rank integer,
  joined_at timestamptz not null default now(),
  active boolean not null default true,
  unique (edition_id, company_id)
);

create index if not exists entries_edition_rank_idx on public.entries(edition_id, rank);
create index if not exists entries_company_idx on public.entries(company_id);

create table if not exists credit_packages (
  id uuid primary key default gen_random_uuid(),
  price_usd numeric(10,2) not null unique check (price_usd > 0),
  credits integer not null check (credits > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.credit_packages (price_usd, credits) values
  (10,100),(25,275),(50,600),(100,1300),(250,3500),(500,8000)
on conflict (price_usd) do update set credits = excluded.credits;

create table if not exists credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  company_id uuid not null references public.companies(id) on delete cascade,
  edition_id uuid not null references public.monthly_editions(id) on delete restrict,
  package_id uuid not null references public.credit_packages(id) on delete restrict,
  provider text not null default 'mercadopago',
  provider_payment_id text,
  amount_usd numeric(10,2) not null,
  credits integer not null check (credits > 0),
  status text not null default 'pending' check (status in ('pending','approved','rejected','refunded','cancelled')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create unique index if not exists credit_purchases_provider_payment_unique
  on public.credit_purchases(provider, provider_payment_id)
  where provider_payment_id is not null;

create table if not exists credit_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  edition_id uuid not null references public.monthly_editions(id) on delete restrict,
  purchase_id uuid references public.credit_purchases(id) on delete set null,
  movement_type text not null check (movement_type in ('purchase','allocation','adjustment','refund','expiration')),
  amount integer not null,
  balance_after integer,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists event_log (
  id bigint generated always as identity primary key,
  edition_id uuid references public.monthly_editions(id) on delete cascade,
  entry_id uuid references public.entries(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  event_type text not null check (event_type in ('impression','profile_view','ad_click','external_visit')),
  source text,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists event_log_entry_type_time_idx
  on public.event_log(entry_id, event_type, created_at desc);

create table if not exists monthly_winners (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.monthly_editions(id) on delete cascade,
  entry_id uuid not null references public.entries(id) on delete cascade,
  final_rank integer not null,
  badge text,
  created_at timestamptz not null default now(),
  unique (edition_id, final_rank),
  unique (edition_id, entry_id)
);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  template text not null default 'default',
  logo_url text,
  title text not null,
  description text not null,
  category text,
  accent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_touch_updated_at on public.companies;
create trigger companies_touch_updated_at
before update on public.companies
for each row execute function public.touch_updated_at();

drop trigger if exists banners_touch_updated_at on public.banners;
create trigger banners_touch_updated_at
before update on public.banners
for each row execute function public.touch_updated_at();

-- Basic seed categories.
insert into public.categories (name) values
 ('Tecnología'),('Viajes'),('Diseño'),('Comercio'),('Gastronomía'),('Servicios'),('Creativo'),('Business')
on conflict (name) do nothing;

-- RLS: public discovery is readable; writes should go through authenticated/app logic.
alter table public.categories enable row level security;
alter table public.companies enable row level security;
alter table public.monthly_editions enable row level security;
alter table public.entries enable row level security;
alter table public.credit_packages enable row level security;
alter table public.banners enable row level security;
alter table public.monthly_winners enable row level security;
alter table public.event_log enable row level security;
alter table public.profiles enable row level security;
alter table public.credit_purchases enable row level security;
alter table public.credit_movements enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (active = true);

drop policy if exists companies_public_read on public.companies;
create policy companies_public_read on public.companies for select using (active = true and approved = true);

drop policy if exists editions_public_read on public.monthly_editions;
create policy editions_public_read on public.monthly_editions for select using (status in ('active','closed'));

drop policy if exists entries_public_read on public.entries;
create policy entries_public_read on public.entries for select using (active = true);

drop policy if exists packages_public_read on public.credit_packages;
create policy packages_public_read on public.credit_packages for select using (active = true);

drop policy if exists banners_public_read on public.banners;
create policy banners_public_read on public.banners for select using (active = true);

drop policy if exists winners_public_read on public.monthly_winners;
create policy winners_public_read on public.monthly_winners for select using (true);

-- Authenticated users can read their own profile/purchases/movements.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select using (auth.uid() = id);

drop policy if exists purchases_owner_read on public.credit_purchases;
create policy purchases_owner_read on public.credit_purchases for select using (auth.uid() = user_id);

drop policy if exists movements_owner_read on public.credit_movements;
create policy movements_owner_read on public.credit_movements for select using (
  exists (
    select 1 from public.companies c
    where c.id = credit_movements.company_id and c.owner_id = auth.uid()
  )
);

-- Event insertion will be exposed through a server-side endpoint/RPC later.
-- No public insert policy is created here to avoid trusting arbitrary client writes.

-- Helper view for the live ranking.
create or replace view public.live_ranking as
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
  case when e.impressions > 0 then round((e.clicks::numeric / e.impressions::numeric) * 100, 2) else 0 end as ctr,
  e.score,
  e.rank
from public.entries e
join public.companies c on c.id = e.company_id
left join public.categories cat on cat.id = c.category_id
where e.active = true and c.active = true and c.approved = true;
