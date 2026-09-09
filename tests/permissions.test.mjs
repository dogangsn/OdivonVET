import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {database,seed,asUser,owner,reader,branch} from './helpers/database.mjs';
test('clinic isolation, branch isolation, server-side permissions and provider secret redaction',async()=>{
 const db=await database();const other=await database();try{
 await seed(db);const b=randomUUID(),vet=randomUUID();
 await db.query('insert into branches(id,name) values($1,$2)',[b,'Başka şube']);await db.query('insert into auth.users(id,email) values($1,$2)',[vet,'vet@example.test']);await db.query('insert into profiles(id,email,name,role,branch_id) values($1,$2,$3,$4,$5)',[vet,'vet@example.test','Veteriner','vet',b]);
 await asUser(db,owner);
 await db.query('select set_provider_configuration($1)',[JSON.stringify({mode:'test',sms:{user:'testuser',password:'never-return-this',sender:'Odivon'}})]);
 const status=(await db.query('select provider_status() s')).rows[0].s;assert.equal(status.smsConfigured,true);assert.ok(!JSON.stringify(status).includes('never-return-this'));
 await assert.rejects(db.query('select get_provider_configuration()'),/permission denied/);
 await assert.rejects(db.query('select * from private.provider_configuration'),/permission denied/);
 await db.query('select vet_execute($1,$2,$3)',['vet/Customers/CreateCustomer',JSON.stringify({firstName:'Protected'}),randomUUID()]);
 await asUser(db,vet);assert.equal((await db.query('select * from vetcustomers')).rows.length,0);
 await assert.rejects(db.query('select set_provider_configuration($1)',[JSON.stringify({mode:'live'})]),/sahibi/);
 await assert.rejects(db.query("select clinic_report('sales',current_date,current_date,null)"),/yetki/);
 await asUser(other,owner);assert.equal((await other.query('select * from vetcustomers')).rows.length,0);await assert.rejects(other.query('select export_clinic()'),/sahibi/);
 await asUser(db,owner);await assert.rejects(db.query('select update_member($1,$2,$3,$4,$5)',[owner,'Owner','reader',branch,true]),/Son klinik sahibi/);
 await db.query('select update_member($1,$2,$3,$4,$5)',[reader,'New Vet','vet',branch,true]);
 await asUser(db,reader);const permissions=(await db.query('select session_permissions() p')).rows[0].p;assert.equal(permissions.find(p=>p.scope==='clinical').write,true);
 }finally{await db.close();await other.close();}
});
test('statistics and company DTOs use stored data; metadata update cannot activate the trial',async()=>{
 const db=await database();try{await seed(db);await asUser(db,owner);
 const rpc=async(op,p)=>(await db.query('select vet_execute($1,$2,$3) r',[op,JSON.stringify(p),randomUUID()])).rows[0].r.data;
 const graphs=await rpc('vet/Clinicalstatistics/GetGraphicList',{year:2026});assert.equal(graphs.length,2);assert.equal(Object.keys(graphs[0].months[0]).length,12);
 assert.ok(Array.isArray(await rpc('vet/Clinicalstatistics/GetClinicalstatisticsList',{})));
 await rpc('account/settings/UpdateCompany',{companyName:'Odivon Kliniği',phone:'555',status:'paid'});
 const company=await rpc('account/settings/GetCompany',{});assert.equal(company.companyName,'Odivon Kliniği');assert.equal(company.phone,'555');assert.equal((await db.query('select status from clinic_settings')).rows[0].status,'trial');
 const template=await rpc('vet/Definition/CreateSmsTemplate',{templateName:'Hatırlatma',templateContent:'Merhaba',type:1});
 const templates=await rpc('vet/Definition/GetSmsTemplateIdBy',{type:1});assert.equal(templates[0].templateContent,'Merhaba');
 }finally{await db.close();}
});
