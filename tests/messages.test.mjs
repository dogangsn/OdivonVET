import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {deliver,parseReceipt,smsXml,parseSend} from '../supabase/clinic/functions/message-worker/providers.mjs';
import {database,seed,asUser,owner} from './helpers/database.mjs';
test('providers escape XML, parse receipts and test mode makes no network calls',async()=>{
 const config={user:'a&b',password:'<secret>',sender:'Odivon'};const job={id:'test',recipient:'905331234567',body:'A < B & C',channel:'sms'};
 assert.match(smsXml(job,config),/A &lt; B &amp; C/);assert.match(smsXml(job,config),/pwd="&lt;secret&gt;"/);
 assert.equal(parseSend('$123#1.0').provider_id,'123');assert.equal(parseSend('23').state,'failed');assert.equal(parseReceipt('905331234567 3',job.recipient).state,'delivered');
 assert.equal((await deliver(job,{mode:'test'},()=>{throw new Error('No network allowed');})).provider_id,'test-test');
 assert.equal((await deliver({...job,delivery_mode:'test'},{mode:'live'},()=>{throw new Error('No network allowed');})).provider_id,'test-test');
 assert.equal((await deliver({...job,delivery_mode:'live'},{mode:'test'},()=>{throw new Error('No network allowed');})).state,'failed');
 await assert.rejects(deliver(job,{mode:'live',sms:config},async()=>{throw new Error('lost response')}),/lost response/);
});
test('message lease never reclaims uncertain sends; subscription expiry blocks the queue',async()=>{
 const db=await database();try{
 await seed(db);await asUser(db,owner);
 const key=randomUUID();for(let i=0;i<2;i++)await db.query('select enqueue_message($1,$2,$3,$4,$5)',['sms',['905331234567'],'','Test',key]);
 assert.equal((await db.query('select * from message_outbox')).rows.length,1);
 await assert.rejects(db.query('select enqueue_message($1,$2,$3,$4,$5)',['sms',['905331234567','905339999999'],'','Test',key]),/farklı içerik veya alıcılarla/);
 await db.query('select set_provider_configuration($1)',[JSON.stringify({mode:'live'})]);
 assert.equal((await db.query('select delivery_mode from message_outbox')).rows[0].delivery_mode,'test');
 await db.exec('reset role;set role service_role');const claim=(await db.query('select claim_message_job() j')).rows[0].j;assert.ok(claim.id);
 assert.equal((await db.query('select claim_message_job() j')).rows[0].j,null);
 await db.exec("update message_outbox set updated_at=now()-interval '3 minutes'");assert.equal((await db.query('select claim_message_job() j')).rows[0].j,null);
 assert.equal((await db.query('select state from message_outbox')).rows[0].state,'unknown');
 }finally{await db.close();}
});
