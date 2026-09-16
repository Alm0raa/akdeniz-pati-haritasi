-- Supabase SQL Editor'de bir kez çalıştırın.
alter table public.profiles
add column if not exists paw_color text not null default '#087A50';

alter table public.profiles
drop constraint if exists profiles_paw_color_check;

alter table public.profiles
add constraint profiles_paw_color_check
check (paw_color in ('#087A50','#7146D9','#1677E8','#F08A24','#E64B8C','#F04444'));
