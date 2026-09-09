import test from 'node:test';import assert from 'node:assert/strict';import {advance} from '../supabase/management/functions/clinic-provisioner/state.mjs';
test('uncertain project creation reconciles without creating a second project',async()=>{
 const job={id:'example',state:'queued',attempts:1};let persisted=false;let created=0;
 await assert.rejects(advance(job,{markCreating:async()=>{persisted=true;},createProject:async()=>{created++;throw new Error('network lost');}}),/network lost/);
 assert.equal(persisted,true);
 const result=await advance({...job,state:'creating'},{listProjects:async()=>[{name:'odivon-example',id:'ref'}],createProject:async()=>created++});
 assert.equal(created,1);assert.deepEqual(result,{state:'waiting',project_ref:'ref'});
});
test('unresolved create becomes attention, not a repeated billable create',async()=>{assert.equal((await advance({id:'x',state:'creating',attempts:11},{listProjects:async()=>[]})).state,'attention');});
