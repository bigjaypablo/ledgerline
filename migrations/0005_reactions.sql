create table if not exists reactions (
  article_id text not null references articles (id) on delete cascade,
  voter_id text not null,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  primary key (article_id, voter_id)
);
