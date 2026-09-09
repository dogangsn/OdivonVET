import test from 'node:test';import assert from 'node:assert/strict';
import {database,seed,asUser,owner,reader,branch} from './helpers/database.mjs';
const customer='30000000-0000-0000-0000-000000000001',product='40000000-0000-0000-0000-000000000001',tax='50000000-0000-0000-0000-000000000001';
async function call(db,op,payload,key=crypto.randomUUID()){return (await db.query('select vet_execute($1,$2::jsonb,$3::uuid) as result',[op,JSON.stringify(payload),key])).rows[0].result.data;}
async function fixture(){const db=await database();await seed(db);await db.exec(`insert into vetcustomers(id,branch_id,"firstName") values('${customer}','${branch}','Ada');insert into vettaxis(id,branch_id,"taxName","taxRatio") values('${tax}','${branch}','Test',20);insert into vetproducts(id,branch_id,name,"productTypeId","sellingPrice","buyingPrice","sellingIncludeKDV","taxisId") values('${product}','${branch}','Test ürün',1,120,50,true,'${tax}');`);await asUser(db,owner);return db;}
test('sale is atomic, stock cannot go negative, retries are idempotent and payment cannot exceed debt',async()=>{
 const db=await fixture();try{
  await call(db,'vet/Definition/CreateStockTracking',{productId:product,piece:5});
  const payload={customerId:customer,trans:[{product,quantity:2,discount:5}]},key=crypto.randomUUID();
  const sale=await call(db,'vet/Accounting/CreateSale',payload,key);assert.equal(sale.amount,235);
  assert.deepEqual(await call(db,'vet/Accounting/CreateSale',payload,key),sale);
  await assert.rejects(call(db,'vet/Accounting/CreateSale',{...payload,remark:'different'},key),/farklı/);
  assert.equal((await db.query('select sum(quantity)::float as total from stock_ledger')).rows[0].total,3);
  await assert.rejects(call(db,'vet/Accounting/CreateSale',{customerId:customer,trans:[{product,quantity:4}]}),/Yetersiz stok/);
  assert.equal((await db.query('select count(*)::int as n from vetsalebuyowner')).rows[0].n,1);
  await call(db,'vet/Accounting/CreateSaleCollection',{saleOwnerId:sale.id,amount:100});
  const summary=(await call(db,'vet/Customers/GetSalesCustomerList',{customerId:customer}))[0];assert.equal(summary.saleOwnerId,sale.id);assert.equal(summary.collection,100);assert.equal(summary.rameiningBalance,135);assert.equal(summary.salesContent,'Test ürün');
  const detail=await call(db,'vet/Accounting/GetSalesById',{Id:sale.id});assert.equal(detail.trans[0].product,product);assert.equal(detail.trans[0].unitPrice,120);assert.equal(detail.trans[0].netVat,40);
  const movements=await call(db,'vet/Customers/GetTransactionMovementList',{customerId:customer});assert.equal(movements.length,1);assert.equal(movements[0].amount,235);
  const filtered=await call(db,'vet/SaleBuy/SaleBuyListFilter',{beginDate:'2040-01-01',endDate:'2040-01-31',paymentType:0});assert.deepEqual(filtered,[]);
  await assert.rejects(call(db,'vet/Accounting/CreateSaleCollection',{saleOwnerId:sale.id,amount:136}),/aşamaz/);
  await assert.rejects(call(db,'vet/SaleBuy/DeleteSaleBuy',{id:sale.id}),/tahsilatı/);
  await asUser(db,reader);await assert.rejects(call(db,'vet/Accounting/CreateSale',payload),/yetki/);
  await assert.rejects(db.exec('insert into vetsalebuyowner(total) values(1)'),/permission denied/);
 }finally{await db.close();}
});
test('customer plus patients rolls back on invalid patient; protected fields cannot be set',async()=>{
 const db=await fixture();try{
  await assert.rejects(call(db,'vet/Customers/CreateCustomer',{createCustomers:{firstName:'Test',phoneNumber:'123',patientDetails:[{name:'Pet',animalType:0}]}}),/Hayvan/);
  assert.equal((await db.query('select count(*)::int as n from vetcustomers')).rows[0].n,1);
  await call(db,'vet/Definition/CreateProductCategories',{name:'A',deleted:true,recId:2000});
  const rows=(await db.query('select * from vetproductcategories')).rows;assert.equal(rows.length,1);assert.equal(rows[0].deleted,false);assert.notEqual(rows[0].recId,2000);
 }finally{await db.close();}
});
