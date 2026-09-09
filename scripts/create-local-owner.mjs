import {createClient} from '@supabase/supabase-js';
const url=process.env.ODIVON_CLINIC_URL;
if(!url||!['localhost','127.0.0.1'].includes(new URL(url).hostname))throw new Error('This seed command only supports local Supabase.');
const key=process.env.ODIVON_CLINIC_SERVICE_KEY;const password=process.env.ODIVON_LOCAL_OWNER_PASSWORD;
if(!key||!password||password.length<12)throw new Error('Set the local clinic service key and a password of at least 12 characters.');
const db=createClient(url,key,{auth:{persistSession:false}});const email='owner@example.test';
let existing=await db.rpc('lookup_invited_user',{p_email:email});if(existing.error)throw existing.error;
let id=existing.data;
if(!id){const result=await db.auth.admin.createUser({email,password,email_confirm:true});if(result.error)throw result.error;id=result.data.user.id;}
const result=await db.rpc('prepare_clinic',{p_owner:id,p_email:email,p_owner_name:'Yerel Klinik Sahibi',p_name:'Odivon Vet Yerel Klinik'});if(result.error)throw result.error;
console.log('Local owner ready: owner@example.test / clinic code local-clinic. Existing password and trial are preserved.');
