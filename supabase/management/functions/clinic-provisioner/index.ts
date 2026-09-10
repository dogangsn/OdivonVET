import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
import {advance} from './state.mjs';
import {ManagementApi,migrationQuery} from './management.mjs';
import {clinicWorkerToken} from './token.mjs';
import bundle from './bundle.json' with {type:'json'};
function env(name:string){const value=Deno.env.get(name);if(!value)throw new Error('Missing server configuration: '+name);return value;}
Deno.serve(async req=>{
 if(req.method!=='POST'||req.headers.get('authorization')!=='Bearer '+env('WORKER_TOKEN'))return new Response('Unauthorized',{status:401});
 const db=createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false}});
 let job:any;
 try{
  const api=new ManagementApi(env('SUPABASE_MANAGEMENT_TOKEN'));const org=env('SUPABASE_ORGANIZATION_SLUG');const origin=env('APP_ORIGIN');
  const smtp={smtp_host:env('SMTP_HOST'),smtp_port:env('SMTP_PORT'),smtp_user:env('SMTP_USER'),smtp_pass:env('SMTP_PASSWORD'),smtp_admin_email:env('SMTP_FROM'),smtp_sender_name:'Odivon Vet'};
  const claim=await db.rpc('claim_clinic_job');if(claim.error)throw claim.error;job=claim.data;
  if(!job)return Response.json({state:'idle'});
  const result=await advance(job,{
   markCreating:async()=>{const r=await db.rpc('mark_clinic_creating',{p_id:job.id,p_lease:job.lease_id});if(r.error||!r.data)throw new Error('Lease lost');},
   createProject:(name:string)=>api.call('/projects','POST',{name,organization_slug:org,region:Deno.env.get('SUPABASE_REGION')||'eu-central-1',desired_instance_size:'micro',db_pass:crypto.randomUUID()+crypto.randomUUID()}),
   listProjects:()=>api.call('/projects'),
   healthy:async(ref:string)=>(await api.call('/projects/'+ref)).status==='ACTIVE_HEALTHY',
   migrate:async(j:any)=>{
    const next=bundle.migrations.find(m=>!j.migration_version||m.version>j.migration_version);
    if(!next)return {state:'functions'};
    await api.query(j.project_ref,migrationQuery(next));return {state:'schema',migration_version:next.version};
   },
   deploy:async(j:any)=>{
    if(j.function_index===0){await api.call('/projects/'+j.project_ref+'/secrets','POST',[{name:'WORKER_TOKEN',value:await clinicWorkerToken(env('CLINIC_WORKER_MASTER'),j.project_ref)},{name:'APP_ORIGIN',value:origin},{name:'CLINIC_CODE',value:j.code}]);}
    const fn=bundle.functions[j.function_index];if(!fn)return {state:'owner'};
    const form=new FormData();form.append('metadata',JSON.stringify({name:fn.slug,entrypoint_path:'index.ts',verify_jwt:false}));
    for(const file of fn.files)form.append('file',new Blob([file.source],{type:'application/typescript'}),file.path);
    await api.call('/projects/'+j.project_ref+'/functions/deploy?slug='+fn.slug,'POST',form);
    return {state:'functions',function_index:j.function_index+1};
   },
   owner:async(j:any)=>{
    await api.call('/projects/'+j.project_ref+'/config/auth','PATCH',{...smtp,site_url:origin,uri_allow_list:origin+'/auth/callback*',disable_signup:true,mailer_autoconfirm:false,password_min_length:12});
    const keys=await api.call('/projects/'+j.project_ref+'/api-keys');
    const service=keys.find((k:any)=>k.name==='service_role')?.api_key;const anon=keys.find((k:any)=>k.name==='anon')?.api_key;
    if(!service||!anon)throw new Error('Project keys unavailable');
    const clinic=createClient('https://'+j.project_ref+'.supabase.co',service,{auth:{persistSession:false}});
    let users=await api.query(j.project_ref,'select id from auth.users where lower(email)=lower($1)',[j.email]);
    if(!users.length){const invite=await clinic.auth.admin.inviteUserByEmail(j.email,{data:{name:j.owner_name},redirectTo:origin+'/auth/callback?clinic='+j.code});if(invite.error)throw new Error('Owner invitation failed');users=[invite.data.user];}
    const ownerId=users[0].id;
    const ready=await api.query(j.project_ref,`select public.prepare_clinic($1::uuid,$2,$3,$4) as settings`,[ownerId,j.email,j.owner_name,j.clinic_name]);
    // Each migration and the owner profile are installed before the trial clock starts.
    return {state:'ready',public_url:'https://'+j.project_ref+'.supabase.co',publishable_key:anon,trial_ends_at:ready[0].settings.trial_ends_at};
   }
  });
  const finish=await db.rpc('finish_clinic_job',{p_id:job.id,p_lease:job.lease_id,p_patch:result});if(finish.error||!finish.data)throw new Error('Lease lost');
  return Response.json({id:job.id,state:result.state});
 }catch{
  if(job)await db.rpc('finish_clinic_job',{p_id:job.id,p_lease:job.lease_id,p_patch:{...(job.attempts>20?{state:'attention'}:{}),safe_error:'Kurulum adımı tamamlanamadı; yönetici kaydı kontrol etmeli.'}});
  return Response.json({error:'Provisioning step failed'},{status:503});
 }
});
