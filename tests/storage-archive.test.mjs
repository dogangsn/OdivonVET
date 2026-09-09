import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {randomUUID} from 'node:crypto';
import {backupStorage,restoreStorage} from '../scripts/storage-archive.mjs';
function fake(files,objects){return {from:()=>({select:()=>({order:()=>({range:async(a,b)=>({data:files.slice(a,b+1)})})})}),storage:{from:()=>({download:async path=>objects.has(path)?{data:new Blob([objects.get(path)])}:{error:{statusCode:'404'}},upload:async(path,bytes)=>{if(objects.has(path))return{error:{statusCode:'409'}};objects.set(path,Buffer.from(bytes));return{};}})}};}
test('Storage archive verifies binary round trip, resumes identical uploads and rejects corruption before writes',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'odivon-archive-'));try{
 const id=randomUUID(),branch=randomUUID();const file={id,branch_id:branch,object_path:branch+'/'+id,name:'test.pdf',mime:'application/pdf',state:'ready'};const bytes=Buffer.from([0,1,2,255,128]);
 const archive=await backupStorage(fake([file],new Map([[file.object_path,bytes]])),dir);assert.equal(archive.files[0].archiveSize,5);
 const target=new Map();assert.equal((await restoreStorage(fake([],target),dir)).restored,1);assert.deepEqual(target.get(file.object_path),bytes);
 assert.equal((await restoreStorage(fake([],target),dir)).skipped,1);
 await writeFile(join(dir,'objects',id+'.bin'),'corrupt');const untouched=new Map();await assert.rejects(restoreStorage(fake([],untouched),dir),/checksum/);assert.equal(untouched.size,0);
 }finally{if(!resolve(dir).startsWith(resolve(tmpdir())+ '\\')&&!resolve(dir).startsWith(resolve(tmpdir())+'/'))throw new Error('Unsafe cleanup path');await rm(dir,{recursive:true,force:true});}
});
