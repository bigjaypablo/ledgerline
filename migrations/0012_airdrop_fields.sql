alter table opportunities add column if not exists category text not null default '';
alter table opportunities add column if not exists tags jsonb not null default '[]'::jsonb;
alter table opportunities add column if not exists raised_source text not null default '';
alter table opportunities add column if not exists raised_on date;
alter table opportunities add column if not exists project_status text not null default 'potential';
alter table opportunities add column if not exists status_changed_on timestamptz not null default now();
