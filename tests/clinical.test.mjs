import test from 'node:test';
import assert from 'node:assert/strict';
import {database,seed,asUser,owner,reader,branch} from './helpers/database.mjs';
import {randomUUID} from 'node:crypto';
test('customer/patient detail contracts and paid examination are atomic; hotel charge is computed on server',async()=>{
 const db=await database();try{
 await seed(db);await asUser(db,owner);
 const rpc=async(op,p,key=randomUUID())=>(await db.query('select public.vet_execute($1,$2,$3) result',[op,JSON.stringify(p),key])).rows[0].result.data;
 const customer=await rpc('vet/Customers/CreateCustomer',{createCustomers:{firstName:'Ada',lastName:'Yılmaz',phoneNumber:'555001',eMail:'ada@example.test'}});
 const patient=await rpc('vet/Customers/CreatePatient',{customerId:customer,patientDetails:{name:'Pamuk',animalType:1,active:true}});
 const detail=await rpc('vet/Customers/GetCustomersFindById',{id:customer});
 assert.equal(detail.firstname,'Ada');assert.equal(detail.email,'ada@example.test');assert.equal(detail.patientDetails[0].name,'Pamuk');assert.equal(detail.totalData.totalSaleBuyCount,0);
 const one=await rpc('vet/Patient/GetPatientById',{id:patient.id});assert.equal(one.name,'Pamuk');
 await rpc('vet/Patient/CreateExamination',{customerId:customer,patientId:patient.id,date:new Date().toISOString(),weight:4.2,price:350,status:'Aktif'});
 const updated=await rpc('vet/Customers/GetCustomersFindById',{id:customer});assert.equal(updated.totalData.totalEarnings,350);
 const weights=await rpc('vet/Patient/GetWeightControls',{id:patient.id});assert.equal(weights.length,1);assert.ok(weights[0].controlDate);
 await assert.rejects(rpc('vet/Patient/CreateExamination',{customerId:randomUUID(),patientId:patient.id,price:300}),/eşleşmiyor/);
 const room=await rpc('vet/PetHotels/CreateRoom',{roomName:'Oda 1',price:200,pricingType:1});
 const stay=await rpc('vet/PetHotels/CreateAccomodation',{roomId:room.id,customerId:customer,patientsId:patient.id,checkinDate:'2026-09-01T10:00:00Z',checkoutDate:'2026-09-03T10:00:00Z'});
 await assert.rejects(rpc('vet/PetHotels/CreateAccomodation',{roomId:room.id,customerId:customer,patientsId:patient.id,checkinDate:'2026-09-02T10:00:00Z',checkoutDate:'2026-09-04T10:00:00Z'}),/dolu/);
 await rpc('vet/PetHotels/UpdateCheckOut',{accomodationId:stay.id,checkOutDate:'2026-09-03T10:00:00Z',accomodationAmount:1,collectionAmount:100,paymentId:1});
 assert.equal((await rpc('vet/Customers/GetCustomersFindById',{id:customer})).totalData.totalEarnings,750);
 await asUser(db,reader);await assert.rejects(rpc('vet/Patient/CreateExamination',{customerId:customer,patientId:patient.id,price:5}),/yetki/);
 }finally{await db.close();}
});

test('private files enforce upload reservation, branch access, expiry and owner export',async()=>{
 const db=await database();try{
 await seed(db);await asUser(db,owner);const id=randomUUID();
 const reserve=await db.query('select public.reserve_file($1,$2,$3,$4) f',[id,'lab.pdf',123,'application/pdf']);const f=reserve.rows[0].f;
 await assert.rejects(db.query('select public.finalize_file($1)',[id]),/tamamlanmadı/);
 await db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['clinic-files',f.object_path]);
 await db.query('select public.finalize_file($1)',[id]);
 await asUser(db,reader);assert.equal((await db.query('select * from public.clinic_files')).rows.length,0);
 await assert.rejects(db.query('select public.reserve_file($1,$2,$3,$4)',[randomUUID(),'x',1,'text/plain']),/yetki/);
 await db.exec("reset role;update public.clinic_settings set trial_ends_at=now()-interval '1 second'");
 await asUser(db,owner);assert.equal((await db.query('select * from public.clinic_files')).rows.length,0);
 assert.equal((await db.query('select public.export_files() f')).rows[0].f.length,1);
 assert.equal((await db.query('select * from storage.objects')).rows.length,1);
 await assert.rejects(db.query('select public.delete_file($1)',[id]),/yetki/);
 }finally{await db.close();}
});
