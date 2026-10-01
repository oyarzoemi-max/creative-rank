-- Creative Rank · Supabase Storage for participant logos
-- Run this after supabase/schema.sql in Supabase SQL Editor.

insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do update set public = true;

drop policy if exists "company logos public read" on storage.objects;
create policy "company logos public read"
on storage.objects
for select
using (bucket_id = 'company-logos');

drop policy if exists "company logos owner upload" on storage.objects;
create policy "company logos owner upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "company logos owner update" on storage.objects;
create policy "company logos owner update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "company logos owner delete" on storage.objects;
create policy "company logos owner delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
