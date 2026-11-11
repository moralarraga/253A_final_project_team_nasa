create table capsules(
  user_id uuid primary key references auth.users on delete cascade,
  items jsonb not null default '[]', note text default '', unlock date, sealed_on date,
  updated_at timestamptz default now());
alter table capsules enable row level security;
create policy "own capsule" on capsules for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
