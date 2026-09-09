import test from 'node:test';import assert from 'node:assert/strict';
import {database,asUser} from './helpers/database.mjs';
test('verified signups are idempotent; quota includes retained expired projects; lease cannot be finished by another worker',async()=>{
 const db=await database('management');try{
  await db.exec('update private.platform_settings set provisioning_enabled=true');
  for(let i=1;i<=5;i++){
   const id=`10000000-0000-0000-0000-${String(i).padStart(12,'0')}`;
   await db.exec(`reset role;insert into auth.users(id,email,email_confirmed_at) values('${id}','user${i}@example.test',${i===5?'null':'now()'});`);
   await asUser(db,id);
   if(i===5){await assert.rejects(db.query("select register_clinic('Clinic','clinic-5','Owner')"),/Doğrulanmış/);continue;}
   const one=await db.query('select register_clinic($1,$2,$3) as id',['Clinic','clinic-'+i,'Owner']);
   const two=await db.query('select register_clinic($1,$2,$3) as id',['Clinic','clinic-'+i,'Owner']);assert.equal(one.rows[0].id,two.rows[0].id);
   assert.equal((await db.query('select id from clinic_applications')).rows.length,1);
   await assert.rejects(db.exec("update clinic_applications set paid=true"),/permission denied/);
  }
  await db.exec('reset role');
  assert.equal((await db.query("select count(*)::int n from clinic_applications where state='queued'")).rows[0].n,3);
  assert.equal((await db.query("select count(*)::int n from clinic_applications where state='waitlisted'")).rows[0].n,1);
  await db.exec('set role service_role');
  const job=(await db.query('select claim_clinic_job() job')).rows[0].job;
  const lost=(await db.query('select finish_clinic_job($1,$2,$3) ok',[job.id,crypto.randomUUID(),JSON.stringify({state:'ready'})])).rows[0].ok;assert.equal(lost,false);
  const done=(await db.query('select finish_clinic_job($1,$2,$3) ok',[job.id,job.lease_id,JSON.stringify({state:'creating'})])).rows[0].ok;assert.equal(done,true);
 }finally{await db.close();}
});

test('direct registration generates codes, resumes the same application and preserves quota and isolation',async()=>{
 const db=await database('management');try{
  await db.exec('update private.platform_settings set provisioning_enabled=true');
  const codes=[];
  for(let i=1;i<=4;i++){
   const id=`20000000-0000-0000-0000-${String(i).padStart(12,'0')}`;
   await db.exec(`reset role;insert into auth.users(id,email,email_confirmed_at) values('${id}','direct${i}@example.test',now());`);
   await asUser(db,id);
   const one=await db.query("select register_clinic('Same clinic','Owner') id");
   const two=await db.query("select register_clinic('Same clinic','Owner') id");
   assert.equal(one.rows[0].id,two.rows[0].id);
   const rows=(await db.query('select code,state from clinic_applications')).rows;
   assert.equal(rows.length,1);assert.match(rows[0].code,/^vet-[a-f0-9]{32}$/);codes.push(rows[0].code);
   assert.equal(rows[0].state,i===4?'waitlisted':'queued');
  }
  assert.equal(new Set(codes).size,4);
  await db.exec('reset role;set role anon');
  await assert.rejects(db.query("select register_clinic('Clinic','Owner')"),/permission denied/);
 }finally{await db.close();}
});
