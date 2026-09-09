import test from 'node:test';import assert from 'node:assert/strict';
import {database,asUser,owner} from './helpers/database.mjs';
import {migrationQuery} from '../supabase/management/functions/clinic-provisioner/management.mjs';
test('clinic becomes ready once; retries preserve the original trial deadline and seed definitions',async()=>{
 const db=await database();try{
  await db.query('insert into auth.users(id,email) values($1,$2)',[owner,'owner@example.test']);
  await db.exec('set role service_role');
  const ready=async()=>(await db.query('select prepare_clinic($1,$2,$3,$4) s',[owner,'owner@example.test','Owner','Klinik'])).rows[0].s;
  const first=await ready();const second=await ready();assert.equal(first.trial_ends_at,second.trial_ends_at);assert.equal(first.status,'trial');
  assert.equal((await db.query('select count(*)::int n from branches')).rows[0].n,1);
  assert.equal((await db.query('select count(*)::int n from vetanimalstype')).rows[0].n,4);
  await asUser(db,owner);await assert.rejects(db.query("select activate_paid('TEST-PAID')"),/permission denied/);
  await db.exec('reset role;set role service_role');await db.query("select activate_paid('TEST-PAID')");assert.equal((await ready()).status,'paid');
 }finally{await db.close();}
});
test('provisioning migration retry applies once and rejects modified already-applied SQL',async()=>{
 const db=await database('management');try{
  const migration={version:'test',checksum:'one',sql:'create table public.migration_probe(id int);insert into public.migration_probe values(1);'};
  await db.exec(migrationQuery(migration));await db.exec(migrationQuery(migration));assert.equal((await db.query('select * from migration_probe')).rows.length,1);
  await assert.rejects(db.exec(migrationQuery({...migration,checksum:'two'})),/checksum mismatch/);await db.exec('rollback');
 }finally{await db.close();}
});
