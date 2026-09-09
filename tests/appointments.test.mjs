import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {database,seed,asUser,owner,branch} from './helpers/database.mjs';
test('retained appointment form binds patient, computes duration, filters today and synchronizes vaccine edits atomically',async()=>{
 const db=await database();try{
 await seed(db);await asUser(db,owner);
 const rpc=async(op,p={},key=randomUUID())=>(await db.query('select vet_execute($1,$2,$3) r',[op,JSON.stringify(p),key])).rows[0].r.data;
 const customer=await rpc('vet/Customers/CreateCustomer',{firstName:'Deniz'});
 const patient=await rpc('vet/Customers/CreatePatient',{customerId:customer,patientDetails:{name:'Luna',animalType:1}});
 const payload={patientId:patient.id,customerId:customer,doctorId:'00000000-0000-0000-0000-000000000000',beginDate:'2040-01-02T08:00:00Z',appointmentType:2,status:1,vaccineItems:[]};
 const key=randomUUID();await rpc('vet/Appointment/CreateAppointment',payload,key);await rpc('vet/Appointment/CreateAppointment',payload,key);
 let rows=await rpc('vet/Appointment/AppointmentsList');assert.equal(rows.length,1);assert.equal(rows[0].patientsId,patient.id);assert.equal(new Date(rows[0].endDate)-new Date(rows[0].beginDate),30*60000);assert.deepEqual(rows[0].vaccineItems,[]);
 assert.equal(await rpc('vet/Appointment/AppointmentDateCheckControl',{date:'2040-01-02T08:10:00Z'}),false);
 assert.equal(await rpc('vet/Appointment/AppointmentDateCheckControl',{date:'2040-01-02T08:30:00Z'}),true);
 assert.deepEqual(await rpc('vet/Appointment/GetAppointmentDailyList'),[]);
 await rpc('vet/Appointment/UpdateAppointmentStatus',{id:rows[0].id,status:2});assert.equal(await rpc('vet/Appointment/AppointmentDateCheckControl',{date:payload.beginDate}),true);
 await assert.rejects(rpc('vet/Appointment/CreateAppointment',{...payload,customerId:randomUUID()}),/eşleşmiyor/);
 await assert.rejects(rpc('vet/Appointment/CreateAppointment',{...payload,doctorId:randomUUID()}),/hekim/);
 await rpc('vet/Vaccine/CreateVaccine',{animalType:1,vaccineName:'Klinik aşısı',renewalOption:1,vaccineMedicine:[]});
 const vaccine=(await rpc('vet/Vaccine/VaccineList'))[0];
 const items=[{productId:vaccine.id,date:'2040-02-02T09:00:00Z'}];
 await rpc('vet/Appointment/CreateAppointment',{...payload,appointmentType:1,vaccineItems:items});
 rows=await rpc('vet/Appointment/AppointmentsList');let a=rows.find(r=>r.calendar_id);assert.equal(a.vaccineItems[0].productId,vaccine.id);assert.equal(a.appointmentType,1);
 await rpc('vet/Appointment/UpdateAppointment',{...payload,id:a.id,appointmentType:1,beginDate:'2040-03-02T09:00:00Z',vaccineItems:items});
 const calendar=(await rpc('vet/VaccineCalendar/PatientVaccineList',{patientId:patient.id}))[0];assert.equal(new Date(calendar.vaccineDate).toISOString(),'2040-03-02T09:00:00.000Z');
 await assert.rejects(rpc('vet/Appointment/CreateAppointment',{...payload,appointmentType:1,vaccineItems:[{...items[0],date:'2041-01-01T09:00:00Z'},{productId:randomUUID()}]}),/eşleşmiyor/);
 assert.equal((await rpc('vet/VaccineCalendar/PatientVaccineList',{patientId:patient.id})).length,1);
 await rpc('vet/Appointment/DeleteAppointment',{id:a.id});assert.equal((await rpc('vet/VaccineCalendar/PatientVaccineList',{patientId:patient.id})).length,0);
 // An earlier response cannot disclose the previous branch after membership changes.
 await db.exec(`reset role;insert into public.branches(id,name) values('20000000-0000-0000-0000-000000000099','Diğer');update profiles set branch_id='20000000-0000-0000-0000-000000000099' where id='${owner}'`);await asUser(db,owner);
 await assert.rejects(rpc('vet/Appointment/CreateAppointment',payload,key),/üyelik veya şube değişmiş/);
 }finally{await db.close();}
});
