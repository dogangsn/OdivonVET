import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
const headers={'Access-Control-Allow-Origin':Deno.env.get('APP_ORIGIN')||'http://localhost:4200','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return new Response('Method not allowed',{status:405,headers});
 try{
  const url=Deno.env.get('SUPABASE_URL')!;const admin=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
  const jwt=req.headers.get('authorization')?.replace(/^Bearer /,'');if(!jwt)return new Response('Unauthorized',{status:401,headers});
  const user=await admin.auth.getUser(jwt);if(user.error||!user.data.user)return new Response('Unauthorized',{status:401,headers});
  const profile=await admin.from('profiles').select('role,active').eq('id',user.data.user.id).single();
  const settings=await admin.from('clinic_settings').select('status,trial_ends_at').single();
  if(profile.data?.role!=='owner'||!profile.data.active||!(settings.data?.status==='paid'||settings.data?.status==='trial'&&Date.parse(settings.data.trial_ends_at)>Date.now()))return new Response('Forbidden',{status:403,headers});
  const body=await req.json();if(typeof body.email!=='string'||typeof body.name!=='string'||body.name.length>120||!['vet','reception','accountant','reader'].includes(body.role))throw new Error('Invalid member');
  const branch=await admin.from('branches').select('id').eq('id',body.branch_id).eq('active',true).single();if(branch.error)throw branch.error;
  const existing=await admin.rpc('lookup_invited_user',{p_email:body.email});if(existing.error)throw existing.error;
  let memberId=existing.data;
  if(!memberId){
   const invite=await admin.auth.admin.inviteUserByEmail(body.email,{redirectTo:Deno.env.get('APP_ORIGIN')+'/auth/callback?clinic='+encodeURIComponent(Deno.env.get('CLINIC_CODE')!),data:{name:body.name}});
   if(invite.error)throw invite.error;memberId=invite.data.user.id;
  }
  const add=await admin.rpc('add_invited_member',{p_actor:user.data.user.id,p_id:memberId,p_name:body.name,p_role:body.role,p_branch:body.branch_id});if(add.error)throw add.error;
  return Response.json({id:memberId},{headers});
 }catch{return Response.json({error:'Üye daveti tamamlanamadı. Tekrar denemeden önce üye listesini kontrol edin.'},{status:400,headers});}
});
