import {mkdir,readFile,writeFile,open} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function validFile(file){
 if(!uuid.test(file.id)||file.object_path!==file.branch_id+'/'+file.id||!uuid.test(file.branch_id))throw new Error('Invalid archive object identity');
 return file.id+'.bin';
}
const missing=error=>['404','not_found','NoSuchKey'].includes(String(error.statusCode||error.code));
export async function backupStorage(client,directory){
 const dir=resolve(directory);await mkdir(join(dir,'objects'),{recursive:true});
 const marker=await open(join(dir,'archive.lock'),'wx');await marker.close();
 const manifest={version:1,bucket:'clinic-files',createdAt:new Date().toISOString(),files:[],pending:[]};
 for(let offset=0;;offset+=500){
  const {data,error}=await client.from('clinic_files').select('*').order('id').range(offset,offset+499);if(error)throw new Error('File inventory could not be read');
  for(const file of data){
   const filename=validFile(file);const result=await client.storage.from('clinic-files').download(file.object_path);
   if(result.error){
    if(file.state==='pending'&&missing(result.error)){manifest.pending.push(file);continue;}
    throw new Error('A retained file could not be downloaded: '+file.id);
   }
   const bytes=Buffer.from(await result.data.arrayBuffer());
   await writeFile(join(dir,'objects',filename),bytes,{flag:'wx'});
   manifest.files.push({...file,archiveSize:bytes.length,sha256:digest(bytes)});
  }
  if(data.length<500)break;
 }
 await writeFile(join(dir,'manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx'});return manifest;
}
export async function restoreStorage(client,directory){
 const dir=resolve(directory);const manifest=JSON.parse(await readFile(join(dir,'manifest.json'),'utf8'));
 if(manifest.version!==1||manifest.bucket!=='clinic-files'||!Array.isArray(manifest.files))throw new Error('Unsupported archive');
 const ids=new Set();const pending=[];let skipped=0;
 // Verify the entire archive and inspect the destination before any writes.
 for(const file of manifest.files){
  const filename=validFile(file);if(ids.has(file.id))throw new Error('Duplicate archive identity');ids.add(file.id);
  const bytes=await readFile(join(dir,'objects',filename));
  if(bytes.length!==file.archiveSize||digest(bytes)!==file.sha256)throw new Error('Archive checksum mismatch: '+file.id);
  const existing=await client.storage.from('clinic-files').download(file.object_path);
  if(!existing.error){
   if(digest(Buffer.from(await existing.data.arrayBuffer()))!==file.sha256)throw new Error('Destination contains a different file: '+file.id);
   skipped++;
  }else{if(!missing(existing.error))throw new Error('Destination could not be inspected');pending.push(file);}
 }
 for(const file of pending){
  const bytes=await readFile(join(dir,'objects',validFile(file)));
  if(digest(bytes)!==file.sha256)throw new Error('Archive changed during restore');
  const uploaded=await client.storage.from('clinic-files').upload(file.object_path,bytes,{contentType:file.mime,upsert:false});
  if(uploaded.error)throw new Error('Restore upload failed: '+file.id);
  const verify=await client.storage.from('clinic-files').download(file.object_path);
  if(verify.error||digest(Buffer.from(await verify.data.arrayBuffer()))!==file.sha256)throw new Error('Restored file verification failed: '+file.id);
 }
 return {restored:pending.length,skipped,pending:manifest.pending?.length||0};
}
