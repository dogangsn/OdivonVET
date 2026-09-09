import test from 'node:test';
import assert from 'node:assert/strict';
import {database,seed,asUser,owner,reader} from './helpers/database.mjs';
test('clinic migrations execute on PostgreSQL; anonymous tables and expired subscriptions are protected',async()=>{
 const db=await database();try{
  await seed(db);await asUser(db,owner);
  assert.equal((await db.query('select private.entitled() as ok')).rows[0].ok,true);
  await assert.rejects(db.exec("update clinic_settings set status='paid'"),/permission denied/);
  await db.exec('reset role;update clinic_settings set trial_ends_at=now()-interval \'1 day\'');
  await asUser(db,owner);assert.equal((await db.query('select private.entitled() as ok')).rows[0].ok,false);
  assert.deepEqual((await db.query('select * from vetcustomers')).rows,[]);
  await db.exec('reset role;set role anon');await assert.rejects(db.query('select * from vetcustomers'),/permission denied/);
 }finally{await db.close();}
});
