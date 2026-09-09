import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../supabase/clinic/',import.meta.url);const migrations=[];const functions=[];
for(const file of (await readdir(new URL('migrations/',base))).filter(f=>f.endsWith('.sql')).sort()){
 const sql=await readFile(new URL('migrations/'+file,base),'utf8');migrations.push({version:file,sql,checksum:createHash('sha256').update(sql).digest('hex')});
}
async function walk(url,prefix='') {const files=[];for(const entry of await readdir(url,{withFileTypes:true})){if(entry.isDirectory())files.push(...await walk(new URL(entry.name+'/',url),prefix+entry.name+'/'));else if(/\.(ts|mjs|json)$/.test(entry.name))files.push({path:prefix+entry.name,source:await readFile(new URL(entry.name,url),'utf8')});}return files;}
for(const dir of await readdir(new URL('functions/',base),{withFileTypes:true})){if(!dir.isDirectory()||dir.name.startsWith('_'))continue;functions.push({slug:dir.name,files:await walk(new URL('functions/'+dir.name+'/',base))});}
await writeFile(new URL('../supabase/management/functions/clinic-provisioner/bundle.json',import.meta.url),JSON.stringify({migrations,functions}));
console.log(`Bundled ${migrations.length} migrations and ${functions.length} clinic functions.`);
