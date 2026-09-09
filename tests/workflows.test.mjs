import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {database,seed,asUser,owner} from './helpers/database.mjs';
test('vaccine schedule creates linked appointments, completion retains definition identity, dashboard handles calendar records',async()=>{
 const db=await database();try{
 await seed(db);await asUser(db,owner);
 const rpc=async(op,p,key=randomUUID())=>(await db.query('select vet_execute($1,$2,$3) r',[op,JSON.stringify(p),key])).rows[0].r.data;
 const customer=await rpc('vet/Customers/CreateCustomer',{firstName:'Ayşe'});
 const patient=await rpc('vet/Customers/CreatePatient',{customerId:customer,patientDetails:{name:'Mavi',animalType:1}});
 await rpc('vet/Vaccine/CreateVaccine',{animalType:1,vaccineName:'Klinik tanımı',timeDone:60,renewalOption:1,vaccineMedicine:[]});
 const vaccine=(await rpc('vet/Vaccine/VaccineList',{}))[0];
 const key=randomUUID();const payload={vaccineCalendars:[{patientId:patient.id,vaccineId:vaccine.id,vaccineDate:'2026-10-01T08:00:00Z'}]};
 await rpc('vet/VaccineCalendar/CreateVaccineExamination',payload,key);await rpc('vet/VaccineCalendar/CreateVaccineExamination',payload,key);
 const appointments=await rpc('vet/Appointment/AppointmentsList',{appointmentType:0});assert.equal(appointments.length,1);assert.equal(appointments[0].patientName,'Mavi');assert.ok(appointments[0].startDate);
 const calendar=(await rpc('vet/VaccineCalendar/PatientVaccineList',{patientId:patient.id}))[0];
 await rpc('vet/VaccineCalendar/UpdateVaccineExamination',{id:calendar.id,vaccinationDate:'2026-10-01T08:00:00Z',createNextAppointment:true,nextVaccinationDate:'2027-10-01T08:00:00Z'});
 const calendars=await rpc('vet/VaccineCalendar/PatientVaccineList',{patientId:patient.id});assert.equal(calendars.length,2);assert.equal(calendars[1].vaccineId,vaccine.id);
 const dashboard=await rpc('vet/Dashboard/GetDashBoard',{});assert.ok(dashboard.totalCount);assert.ok(Array.isArray(dashboard.upcomingAppointment));
 }finally{await db.close();}
});
test('stock exit and correction are reflected once; impossible correction leaves ledger and document unchanged',async()=>{
 const db=await database();try{
 await seed(db);await asUser(db,owner);
 const rpc=async(op,p)=>(await db.query('select vet_execute($1,$2,$3) r',[op,JSON.stringify(p),randomUUID()])).rows[0].r.data;
 const product=await rpc('vet/Definition/CreateProductDescription',{name:'Mama',productTypeId:1,sellingPrice:100,buyingPrice:50});
 await rpc('vet/Definition/CreateStockTracking',{productId:product.id,piece:10,type:1});
 await rpc('vet/Definition/CreateStockTracking',{productId:product.id,piece:3,type:2});
 assert.equal((await rpc('vet/Definition/ProductDescriptionList',{}))[0].stock,7);
 const entry=(await rpc('vet/Definition/StockTrackingProductFilter',{productId:product.id}))[0];
 await assert.rejects(rpc('vet/Definition/UpdateStockTracking',{id:entry.id,piece:2,type:1}),/Yetersiz stok/);
 assert.equal((await rpc('vet/Definition/ProductDescriptionList',{}))[0].stock,7);
 await rpc('vet/Definition/UpdateStockTracking',{id:entry.id,piece:8,type:1});assert.equal((await rpc('vet/Definition/ProductDescriptionList',{}))[0].stock,5);
 }finally{await db.close();}
});
