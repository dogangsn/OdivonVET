import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {database,seed,asUser,owner,reader} from './helpers/database.mjs';
test('cheque retries are stable, closed cheques cannot change, shortcuts accept internal links, reports return twelve months',async()=>{
 const db=await database();try{
 await seed(db);await asUser(db,owner);
 const rpc=async(op,p={})=>(await db.query('select vet_execute($1,$2,$3) r',[op,JSON.stringify(p),randomUUID()])).rows[0].r.data;
 const payload={number:'C-1',amount:500,due_date:'2026-10-01',status:'portfolio'};const key=randomUUID();
 const save=async(p,k=key)=>(await db.query('select save_cheque($1,$2) id',[JSON.stringify(p),k])).rows[0].id;
 const id=await save(payload);assert.equal(await save(payload),id);assert.equal((await db.query('select * from cheques')).rows.length,1);
 await assert.rejects(save({...payload,amount:501}),/farklı içerikle/);
 await save({...payload,id,status:'collected'},randomUUID());await assert.rejects(save({...payload,id},randomUUID()),/Kapanmış/);
 const s=await rpc('vet/GeneralSettings/CreateShortCuts',{shortcut:{label:'Müşteriler',link:'/customerlist',icon:'heroicons_outline:users'}});assert.equal(s.link,'/customerlist');assert.equal(s.useRouter,true);
 await assert.rejects(rpc('vet/GeneralSettings/CreateShortCuts',{shortcut:{label:'Bad',link:'javascript:alert(1)'}}),/uygulama içindeki/);
 const report=await rpc('vet/Reports/GetAppointmentDashboard');assert.equal(report.monthlyAppointmentCounts.length,12);assert.equal(report.totalAppointmentYear,0);
 const branch=await rpc('account/settings/CreateBranch',{name:'İkinci',district:'Merkez',address:'Test adresi',phone:'0000000000'});assert.equal(branch.address,'Test adresi');
 const edited=await rpc('account/settings/UpdateBranch',{id:branch.id,name:'Yeni ad',district:'Yeni ilçe',address:'Yeni adres',phone:'1111111111'});assert.equal(edited.district,'Yeni ilçe');assert.equal(edited.phone,'1111111111');
 const parameters=await rpc('vet/Settings/ParametersList');assert.equal(parameters.length,1);assert.equal(parameters[0].appointmentSeansDuration,30);
 assert.equal((await db.query('select session_entitlement() ok')).rows[0].ok,true);
 await db.exec("reset role;update clinic_settings set trial_ends_at=now()-interval '1 day'");await asUser(db,owner);assert.equal((await db.query('select session_entitlement() ok')).rows[0].ok,false);
 await assert.rejects(save(payload),/abonelik/);await asUser(db,reader);await assert.rejects(save(payload),/yetki/);
 }finally{await db.close();}
});
