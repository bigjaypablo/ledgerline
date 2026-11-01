create table if not exists page_events (
  id bigserial primary key,
  kind text not null check (kind in ('view', 'impression')),
  article_id text,
  path text not null default '',
  referrer text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists page_events_kind_time_idx on page_events (kind, created_at desc);
create index if not exists page_events_article_idx on page_events (article_id, kind, created_at desc);
