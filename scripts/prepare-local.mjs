import {cp,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
for(const name of ['management','clinic']){
 const target=resolve('.local',name,'supabase');await mkdir(target,{recursive:true});
 // Canonical migrations remain in supabase/. The CLI expects a supabase/ child of its workdir.
 for(const entry of ['migrations','functions','config.toml'])await cp(resolve('supabase',name,entry),resolve(target,entry),{recursive:true,force:true});
}
await writeFile('.local/clinic/worker.env','PROVIDER_MODE=test\nWORKER_TOKEN=local-development-worker-only\nAPP_ORIGIN=http://localhost:4200\nCLINIC_CODE=local-clinic\n');
console.log('Prepared .local/management and .local/clinic. Start both with Supabase CLI after Docker is running.');
