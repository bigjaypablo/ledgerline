create table if not exists opportunities (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  name text not null,
  chain text not null default '',
  kind text not null check (kind in ('airdrop','testnet','points')),
  reward_status text not null default 'potential' check (reward_status in ('confirmed','potential','none')),
  summary text not null default '',
  capital text not null default 'gas_only' check (capital in ('none','gas_only','funds_at_risk')),
  cost_note text not null default '',
  time_minutes integer,
  deadline date,
  official_url text not null,
  risk_note text not null default '',
  sponsored boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  verified_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists opportunities_status_idx on opportunities (status, deadline);
