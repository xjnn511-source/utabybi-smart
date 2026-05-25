
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

create policy "Public read media"
on storage.objects for select
using (bucket_id = 'media');

create policy "Authenticated upload media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media');

create policy "Anon upload media"
on storage.objects for insert
to anon
with check (bucket_id = 'media');
