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
