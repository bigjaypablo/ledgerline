alter table comments add column if not exists parent_id text references comments (id) on delete cascade;
alter table comments add column if not exists user_id text;

create table if not exists comment_likes (
  comment_id text not null references comments (id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
