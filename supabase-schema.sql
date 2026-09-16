-- Supabase SQL Editor'de bir kez çalıştırın.
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('member','moderator','super_admin');
  end if;
end $$;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '', last_name text not null default '',
  faculty text, department text,
  role public.user_role not null default 'member',
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
grant select, update on public.profiles to authenticated;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using ((select auth.uid())=id);
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$ begin
 insert into public.profiles(id,first_name,last_name,faculty,department,role)
 values(new.id,coalesce(new.raw_user_meta_data->>'first_name',''),coalesce(new.raw_user_meta_data->>'last_name',''),nullif(new.raw_user_meta_data->>'faculty',''),nullif(new.raw_user_meta_data->>'department',''),'member');
 return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- PATI PUAN SISTEMI
create table if not exists public.contributions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  point_ref text not null,
  action_type text not null check (action_type in ('food','water','photo','still_has_food','food_empty','checked','trip_completed','moderator_error')),
  points integer not null check (points >= 0),
  is_valid boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists contributions_user_created_idx on public.contributions(user_id,created_at desc);
create index if not exists contributions_point_created_idx on public.contributions(point_ref,created_at desc);
alter table public.contributions enable row level security;
revoke all on public.contributions from anon, authenticated;
grant select on public.contributions to authenticated;
drop policy if exists "users read own contributions" on public.contributions;
create policy "users read own contributions" on public.contributions for select to authenticated using ((select auth.uid())=user_id);

create or replace function public.record_contribution(point_ref text, action_name text)
returns integer language plpgsql security definer set search_path='' as $$
declare awarded integer; last_action timestamptz;
begin
 if auth.uid() is null then raise exception 'Giris yapmalisiniz'; end if;
 if exists(select 1 from public.profiles where id=auth.uid() and is_suspended=true) then raise exception 'Hesap askida'; end if;
 awarded := case action_name when 'food' then 20 when 'water' then 20 when 'photo' then 30 when 'still_has_food' then 5 when 'food_empty' then 5 when 'checked' then 5 when 'trip_completed' then 5 when 'moderator_error' then 10 else null end;
 if awarded is null then raise exception 'Gecersiz islem'; end if;
 if action_name='moderator_error' then raise exception 'Bu puan yalnizca moderator onayiyla verilir'; end if;
 select max(created_at) into last_action from public.contributions where user_id=auth.uid() and contributions.point_ref=record_contribution.point_ref and action_type=action_name and is_valid=true;
 if last_action is not null and last_action > now()-interval '30 minutes' then raise exception 'Bu noktadan yeniden puan kazanmak icin beklemelisiniz'; end if;
 insert into public.contributions(user_id,point_ref,action_type,points) values(auth.uid(),point_ref,action_name,awarded);
 return awarded;
end $$;
grant execute on function public.record_contribution(text,text) to authenticated;

create or replace function public.get_my_point_summary()
returns table(points bigint,total bigint,food bigint,water bigint,photo bigint)
language sql security definer set search_path='' stable as $$
 select coalesce(sum(c.points) filter(where c.is_valid),0),count(*) filter(where c.is_valid),count(*) filter(where c.is_valid and c.action_type='food'),count(*) filter(where c.is_valid and c.action_type='water'),count(*) filter(where c.is_valid and c.action_type='photo') from public.contributions c where c.user_id=auth.uid();
$$;
grant execute on function public.get_my_point_summary() to authenticated;

create or replace function public.get_leaderboard(period_name text default 'all')
returns table(user_id uuid,first_name text,last_name text,points bigint)
language sql security definer set search_path='' stable as $$
 select p.id,p.first_name,p.last_name,coalesce(sum(c.points),0)::bigint from public.profiles p join public.contributions c on c.user_id=p.id and c.is_valid=true where p.is_suspended=false and (period_name='all' or (period_name='week' and c.created_at>=date_trunc('week',now())) or (period_name='month' and c.created_at>=date_trunc('month',now()))) group by p.id,p.first_name,p.last_name order by 4 desc limit 50;
$$;
grant execute on function public.get_leaderboard(text) to authenticated;
