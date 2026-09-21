-- SOSYAL ALAN MIGRATION
create extension if not exists pgcrypto;
create table if not exists public.social_posts(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 post_type text not null check(post_type in('support','level_up')), point_id bigint references public.feeding_points(id) on delete set null,
 action_type text, level_name text, body text, photo_url text, created_at timestamptz not null default now()
);
create table if not exists public.social_likes(
 post_id uuid references public.social_posts(id) on delete cascade,user_id uuid references auth.users(id) on delete cascade,created_at timestamptz default now(),primary key(post_id,user_id)
);
create table if not exists public.social_comments(
 id uuid primary key default gen_random_uuid(),post_id uuid references public.social_posts(id) on delete cascade,user_id uuid references auth.users(id) on delete cascade,body text not null check(char_length(body) between 1 and 500),created_at timestamptz default now()
);
alter table public.social_posts enable row level security;alter table public.social_likes enable row level security;alter table public.social_comments enable row level security;
drop policy if exists "social posts public read" on public.social_posts;create policy "social posts public read" on public.social_posts for select using(true);
drop policy if exists "members create posts" on public.social_posts;create policy "members create posts" on public.social_posts for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "owners delete posts" on public.social_posts;create policy "owners delete posts" on public.social_posts for delete to authenticated using(auth.uid()=user_id);
drop policy if exists "likes public read" on public.social_likes;create policy "likes public read" on public.social_likes for select using(true);
drop policy if exists "members like" on public.social_likes;create policy "members like" on public.social_likes for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "members unlike" on public.social_likes;create policy "members unlike" on public.social_likes for delete to authenticated using(auth.uid()=user_id);
drop policy if exists "comments public read" on public.social_comments;create policy "comments public read" on public.social_comments for select using(true);
drop policy if exists "members comment" on public.social_comments;create policy "members comment" on public.social_comments for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "owners delete comments" on public.social_comments;create policy "owners delete comments" on public.social_comments for delete to authenticated using(auth.uid()=user_id);
create or replace function public.toggle_social_like(target_post_id uuid) returns void language plpgsql security definer set search_path='' as $$ begin if auth.uid() is null then raise exception 'Giriş yapmalısın';end if;if exists(select 1 from public.social_likes where post_id=target_post_id and user_id=auth.uid())then delete from public.social_likes where post_id=target_post_id and user_id=auth.uid();else insert into public.social_likes(post_id,user_id)values(target_post_id,auth.uid());end if;end;$$;
grant execute on function public.toggle_social_like(uuid) to authenticated;
create or replace view public.social_feed as
select p.id,p.post_type,p.action_type,p.level_name,p.body,p.photo_url,p.created_at,p.user_id,fp.name point_name,
 trim(coalesce(pr.first_name,'')||' '||coalesce(pr.last_name,'')) full_name,
 case when pr.avatar_id is null then null else '/avatars/'||pr.avatar_id||'.png' end avatar_url,
 (select count(*) from public.social_likes l where l.post_id=p.id) like_count,
 (select count(*) from public.social_comments c where c.post_id=p.id) comment_count,
 false liked_by_me,
 coalesce(p.action_type,'destek') action_label,
 'Yeni Pati'::text level_display
from public.social_posts p left join public.profiles pr on pr.id=p.user_id left join public.feeding_points fp on fp.id=p.point_id;
grant select on public.social_feed to anon,authenticated;
do $$ begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='social_posts')then alter publication supabase_realtime add table public.social_posts;end if;if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='social_likes')then alter publication supabase_realtime add table public.social_likes;end if;if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='social_comments')then alter publication supabase_realtime add table public.social_comments;end if;end $$;