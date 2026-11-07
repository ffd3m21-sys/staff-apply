create table applications (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  discord_id text unique not null,
  discord_username text,
  discord_roles text[],
  age int,
  been_in_server boolean,
  was_staff boolean,
  staff_details text,
  sold_products boolean,
  sold_details text,
  can_make_apps boolean,
  apps_details text,
  extra text
);
-- Locks the table so only your website (using the secret key) can write to it
alter table applications enable row level security;
