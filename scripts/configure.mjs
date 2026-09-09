import { writeFile, mkdir } from 'node:fs/promises';
const management={url:process.env.ODIVON_MANAGEMENT_URL,publishableKey:process.env.ODIVON_MANAGEMENT_PUBLIC_KEY};
if(!management.url || !management.publishableKey) throw new Error('Set ODIVON_MANAGEMENT_URL and ODIVON_MANAGEMENT_PUBLIC_KEY. Never use a secret/service-role key.');
function publicKey(key){
 if(typeof key!=='string'||!key.trim())throw new Error('A public key is required for each configured project');
 if(key.startsWith('sb_secret_')) throw new Error('Secret keys must not enter browser configuration');
 if(key.startsWith('eyJ')){const body=JSON.parse(Buffer.from(key.split('.')[1],'base64url'));if(body.role!=='anon')throw new Error('Only anon/public keys are allowed');}
}
publicKey(management.publishableKey);
const clinics=[];
if(process.env.ODIVON_CLINIC_URL){publicKey(process.env.ODIVON_CLINIC_PUBLIC_KEY);clinics.push({code:process.env.ODIVON_CLINIC_CODE||'local-clinic',url:process.env.ODIVON_CLINIC_URL,publishableKey:process.env.ODIVON_CLINIC_PUBLIC_KEY});}
await mkdir('src/assets',{recursive:true});await writeFile('src/assets/odivon-config.json',JSON.stringify({management,clinics,turnstileSiteKey:process.env.ODIVON_TURNSTILE_SITE_KEY||undefined},null,2));
console.log('Wrote public Odivon configuration.');
