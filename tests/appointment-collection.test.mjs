import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {database,seed,asUser,owner} from './helpers/database.mjs';
test('PascalCase appointment collection creates one sale and payment, rejects duplicate charging, and prices vaccine stock atomically',async()=>{
 const db=await database();try{
 await seed(db);await asUser(db,owner);
 const rpc=async(op,p={},key=randomUUID())=>(await db.query('select vet_execute($1,$2,$3) r',[op,JSON.stringify(p),key])).rows[0].r.data;
 const customer=await rpc('vet/Customers/CreateCustomer',{FirstName:'Deniz'});
 const patient=await rpc('vet/Customers/CreatePatient',{CustomerId:customer,PatientDetails:{Name:'Mavi',AnimalType:1}});
 await rpc('vet/Appointment/CreateAppointment',{PatientId:patient.id,CustomerId:customer,BeginDate:new Date().toISOString(),AppointmentType:2,Status:1});
 let appointment=(await rpc('vet/Appointment/AppointmentsList'))[0];await rpc('vet/Appointment/UpdateCompletedAppointment',{Id:appointment.id,IsCompleted:true});
 const methods=await rpc('vet/Definition/CreatePaymentMethods',{name:'Nakit'});
 const p={CustomerId:customer,CollectionId:appointment.id,PaymentType:methods.recId,Amount:125,EnterAmount:true};const key=randomUUID();
 const queued=await rpc('vet/Customers/GetPaymentTransactionList',{CustomerId:customer});assert.equal(queued[0].id,appointment.id);
 const invoice=await rpc('vet/Customers/CreateCollection',p,key);assert.equal(await rpc('vet/Customers/CreateCollection',p,key),invoice);
 await assert.rejects(rpc('vet/Customers/CreateCollection',p),/zaten ücretlendirilmiş/);
 assert.equal((await rpc('vet/Customers/GetPaymentTransactionList',{CustomerId:customer})).length,0);
 const sale=(await rpc('vet/Customers/GetSalesCustomerList',{CustomerId:customer}))[0];assert.equal(sale.collection,125);assert.equal(sale.rameiningBalance,0);
 const product=await rpc('vet/Definition/CreateProductDescription',{name:'Klinik ürün',productTypeId:1,sellingPrice:100,buyingPrice:50});
 await rpc('vet/Vaccine/CreateVaccine',{animalType:1,vaccineName:'Klinik aşısı',renewalOption:1,vaccineMedicine:[{productId:product.id,quantity:1}]});
 const vaccine=(await rpc('vet/Vaccine/VaccineList'))[0];
 await rpc('vet/Appointment/CreateAppointment',{patientId:patient.id,customerId:customer,beginDate:'2026-10-01T08:00:00Z',appointmentType:1,status:1,vaccineItems:[{productId:vaccine.id,date:'2026-10-01T08:00:00Z'}]});
 appointment=(await rpc('vet/Appointment/AppointmentsList')).find(a=>a.calendar_id);await rpc('vet/Appointment/UpdateCompletedAppointment',{id:appointment.id,isCompleted:true});
 const vaccinePayment={...p,CollectionId:appointment.id,Amount:80};
 await assert.rejects(rpc('vet/Customers/CreateCollection',vaccinePayment),/Yetersiz stok/);assert.equal((await rpc('vet/Customers/GetSalesCustomerList',{customerId:customer})).length,1);
 await rpc('vet/Definition/CreateStockTracking',{productId:product.id,piece:1});await rpc('vet/Customers/CreateCollection',vaccinePayment);
 assert.equal((await rpc('vet/Definition/ProductDescriptionList'))[0].stock,0);
 const sales=await rpc('vet/Customers/GetSalesCustomerList',{customerId:customer});assert.equal(sales[1].amount,80);assert.equal(sales[1].collection,80);
 const payment=(await rpc('vet/Customers/GetPayChartList',{customerId:customer})).find(c=>c.saleBuyId===sales[1].saleOwnerId);
 await rpc('vet/Accounting/DeleteCollection',{id:payment.id});assert.equal((await rpc('vet/Appointment/AppointmentsList')).find(a=>a.id===appointment.id).isPaymentReceived,false);
 await assert.rejects(rpc('vet/Appointment/UpdatePaymentReceivedAppointment',{id:appointment.id,isPaymentReceived:true}),/tahsilat kayıtlarından/);
 await rpc('vet/SaleBuy/DeleteSaleBuy',{id:sales[1].saleOwnerId});assert.equal((await rpc('vet/Definition/ProductDescriptionList'))[0].stock,1);
 await assert.rejects(rpc('vet/Customers/CreateCustomer',{FirstName:'A',firstName:'B'}),/Çelişen/);
 }finally{await db.close();}
});
