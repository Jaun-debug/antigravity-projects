-- ============================================================
-- Namibia Rates — Trade Platform · Database Schema (Supabase / Postgres)
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================
-- Supabase Auth already provides the `auth.users` table (handles
-- passwords, sessions, email verification). We layer profiles + data on top.
-- Row-Level Security (RLS) is enabled on every table so the database itself
-- guarantees an agent can only ever read their OWN rates/assignments.
-- ============================================================

-- ---------- PROFILES (one row per logged-in user) ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'agent' check (role in ('agent','owner','admin')),
  company_name text,
  contact_name text,
  phone        text,
  status       text not null default 'pending' check (status in ('pending','active','suspended')),
  created_at   timestamptz default now()
);

-- ---------- LODGES ----------
create table if not exists public.lodges (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,          -- e.g. 'camp-kwando' (the URL)
  name       text not null,
  region     text,
  owner_id   uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ---------- RATES (the base rack sheet; tier prices are computed) ----------
create table if not exists public.rates (
  id         uuid primary key default gen_random_uuid(),
  lodge_id   uuid references public.lodges(id) on delete cascade,
  section    text,                          -- 'Bed & Breakfast', 'Activities', ...
  room_type  text not null,                 -- 'Tented River Chalet — Double (pp sharing)'
  rack_price numeric not null,              -- published rack rate
  sort       int default 0
);
-- Tier price = rack_price * (1 - tier/100). 20% STO => rack * 0.80.

-- ---------- ASSIGNMENTS (agent -> tier for a lodge; the "drag into box") ----------
create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  lodge_id    uuid references public.lodges(id) on delete cascade,
  agent_id    uuid references public.profiles(id) on delete cascade,
  tier        int not null check (tier in (15,20,25,30)),
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz default now(),
  unique (lodge_id, agent_id)
);

-- ---------- CONTRACT TEMPLATES ----------
create table if not exists public.contract_templates (
  id         uuid primary key default gen_random_uuid(),
  lodge_id   uuid references public.lodges(id) on delete cascade,  -- null = global template
  version    int not null default 1,
  body       text not null,
  created_at timestamptz default now()
);

-- ---------- SIGNED CONTRACTS (audit trail) ----------
create table if not exists public.contracts (
  id               uuid primary key default gen_random_uuid(),
  lodge_id         uuid references public.lodges(id) on delete cascade,
  agent_id         uuid references public.profiles(id) on delete cascade,
  template_version int not null,
  signed_name      text not null,
  signed_at        timestamptz default now(),
  ip               text,
  unique (lodge_id, agent_id, template_version)
);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
alter table public.profiles    enable row level security;
alter table public.lodges      enable row level security;
alter table public.rates       enable row level security;
alter table public.assignments enable row level security;
alter table public.contracts   enable row level security;
alter table public.contract_templates enable row level security;

-- helper: is the current user an owner of this lodge?
create or replace function public.is_lodge_owner(p_lodge uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.lodges l where l.id = p_lodge and l.owner_id = auth.uid());
$$;

-- PROFILES: a user manages their own profile; owners/admin may read others (assignment pool)
create policy "own profile read"   on public.profiles for select using (id = auth.uid());
create policy "own profile write"  on public.profiles for update using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert with check (id = auth.uid());
create policy "owners read agents" on public.profiles for select
  using (exists (select 1 from public.profiles me where me.id = auth.uid() and me.role in ('owner','admin')));

-- LODGES: rack info is public-readable; owners manage their own
create policy "lodges public read" on public.lodges for select using (true);
create policy "owners manage lodges" on public.lodges for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- RATES: rack is public (it's published); owners manage their lodge's rates
create policy "rates public read" on public.rates for select using (true);
create policy "owners manage rates" on public.rates for all
  using (public.is_lodge_owner(lodge_id)) with check (public.is_lodge_owner(lodge_id));

-- ASSIGNMENTS: an agent sees only their own; owners manage their lodge's
create policy "agent reads own assignment" on public.assignments for select
  using (agent_id = auth.uid());
create policy "owner manages assignments" on public.assignments for all
  using (public.is_lodge_owner(lodge_id)) with check (public.is_lodge_owner(lodge_id));

-- CONTRACTS: agent reads/signs own; owner reads their lodge's
create policy "agent reads own contracts" on public.contracts for select
  using (agent_id = auth.uid());
create policy "agent signs own contract" on public.contracts for insert
  with check (agent_id = auth.uid());
create policy "owner reads lodge contracts" on public.contracts for select
  using (public.is_lodge_owner(lodge_id));

-- CONTRACT TEMPLATES: readable by anyone authenticated; owners manage their own
create policy "templates read" on public.contract_templates for select using (true);
create policy "owners manage templates" on public.contract_templates for all
  using (lodge_id is null or public.is_lodge_owner(lodge_id))
  with check (lodge_id is null or public.is_lodge_owner(lodge_id));

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, status) values (new.id, 'agent', 'pending')
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
