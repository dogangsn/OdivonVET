import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
export async function database(kind='clinic'){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated,service_role;grant execute on function auth.uid() to authenticated,service_role;
 create schema storage;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,metadata jsonb);
 alter table storage.objects enable row level security;
 grant usage on schema storage to authenticated;grant select,insert on storage.objects to authenticated;`);
 const dir=new URL('../../supabase/'+kind+'/migrations/',import.meta.url);
 for(const f of (await readdir(dir)).filter(f=>f.endsWith('.sql')).sort()){
  try{await db.exec(await readFile(new URL(f,dir),'utf8'));}catch(e){await db.close();throw new Error(f+': '+e.message,{cause:e});}
 }
 return db;
}
export const owner='10000000-0000-0000-0000-000000000001';
export const reader='10000000-0000-0000-0000-000000000002';
export const branch='20000000-0000-0000-0000-000000000001';
export async function seed(db){await db.exec(`
 insert into public.clinic_settings(id,name,status,trial_ends_at) values(true,'Test','trial',now()+interval '14 days');
 insert into public.branches(id,name) values('${branch}','Merkez');
 insert into auth.users(id,email) values('${owner}','owner@example.test'),('${reader}','reader@example.test');
 insert into public.profiles(id,email,name,role,branch_id) values('${owner}','owner@example.test','Owner','owner','${branch}'),('${reader}','reader@example.test','Reader','reader','${branch}');
 `);}
export async function asUser(db,id){await db.exec(`reset role;select set_config('request.jwt.claim.sub','${id}',false);set role authenticated;`);}
