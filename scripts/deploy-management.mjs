import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {ManagementApi} from '../supabase/management/functions/clinic-provisioner/management.mjs';
import {MANAGEMENT_FUNCTIONS,authConfig,managementMigrationQuery,managementSecrets,requiredDeploymentEnv,vaultUpsertSql} from './lib/management-deployment.mjs';

const root=resolve(import.meta.dirname,'..');
const env=requiredDeploymentEnv(process.env);
const api=new ManagementApi(env.SUPABASE_ACCESS_TOKEN);
const ref=env.ODIVON_MANAGEMENT_PROJECT_REF;

async function files(dir,prefix=''){
 const result=[];
 for(const entry of await readdir(dir,{withFileTypes:true})){
  if(entry.isDirectory())result.push(...await files(resolve(dir,entry.name),prefix+entry.name+'/'));
  else result.push({path:prefix+entry.name,source:await readFile(resolve(dir,entry.name),'utf8')});
 }
 return result;
}

async function deployFunction(slug){
 const source=await files(resolve(root,'supabase/management/functions',slug));
 const form=new FormData();
 form.append('metadata',JSON.stringify({name:slug,entrypoint_path:'index.ts',verify_jwt:false}));
 for(const file of source)form.append('file',new Blob([file.source],{type:file.path.endsWith('.json')?'application/json':'application/typescript'}),file.path);
 await api.call('/projects/'+ref+'/functions/deploy?slug='+slug,'POST',form);
}

console.log('Deploying management database migrations...');
const migrationDir=resolve(root,'supabase/management/migrations');
for(const name of (await readdir(migrationDir)).filter(name=>name.endsWith('.sql')).sort()){
 const sql=await readFile(resolve(migrationDir,name),'utf8');
 await api.query(ref,managementMigrationQuery(name.replace(/\.sql$/,''),sql));
 console.log('Applied',name);
}

console.log('Configuring management Auth and Edge secrets...');
await api.call('/projects/'+ref+'/config/auth','PATCH',authConfig(env));
await api.call('/projects/'+ref+'/secrets','POST',managementSecrets(env));

for(const slug of MANAGEMENT_FUNCTIONS){await deployFunction(slug);console.log('Deployed',slug);}

const managementUrl='https://'+ref+'.supabase.co';
await api.query(ref,vaultUpsertSql(managementUrl,env.ODIVON_WORKER_TOKEN));
await api.query(ref,await readFile(resolve(root,'supabase/management/ops/scheduler.sql'),'utf8'));

const deployedAuth=await api.call('/projects/'+ref+'/config/auth');
if(deployedAuth.disable_signup||!deployedAuth.external_email_enabled||!deployedAuth.mailer_autoconfirm||deployedAuth.password_min_length!==12||!deployedAuth.security_captcha_enabled)throw new Error('Management Auth smoke check failed; provisioning remains disabled.');
for(const slug of MANAGEMENT_FUNCTIONS){const fn=await api.call('/projects/'+ref+'/functions/'+slug);if(fn.status!=='ACTIVE')throw new Error(slug+' is not active; provisioning remains disabled.');}
await api.query(ref,"select id from public.clinic_applications limit 0");

const rows=await api.query(ref,"select trial_slots,provisioning_enabled from private.platform_settings where id=true");
if(rows[0]?.trial_slots!==3)throw new Error('Unexpected trial slot count; refusing to enable provisioning.');
if(env.ODIVON_ENABLE_PROVISIONING==='true'){
 await api.query(ref,"update private.platform_settings set provisioning_enabled=true where id=true and trial_slots=3");
 console.log('Automatic provisioning enabled for three trial slots.');
}else console.log('Provisioning remains disabled. Set ODIVON_ENABLE_PROVISIONING=true after smoke checks.');

console.log('Management deployment completed for',ref);
