import {writeFile, mkdir} from 'node:fs/promises';
export function configuration(env,{requireTurnstile=false}={}) {
 const project = (url, publishableKey) => {
  if (!url || !publishableKey) throw new Error('Supabase URL and public key are required.');
  const parsed = new URL(url);
  if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/' || (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(parsed.hostname)))) throw new Error('Invalid Supabase URL. HTTPS is required except on localhost.');
  let valid = /^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey);
  if (publishableKey.startsWith('eyJ')) {
   try { valid = publishableKey.split('.').length === 3 && JSON.parse(Buffer.from(publishableKey.split('.')[1],'base64url')).role === 'anon'; } catch { valid = false; }
  }
  if (!valid) throw new Error('Only publishable/anon keys are allowed in browser configuration.');
  return {url:parsed.origin,publishableKey};
 };
 const management = project(env.ODIVON_MANAGEMENT_URL ?? env.NEXT_PUBLIC_SUPABASE_URL, env.ODIVON_MANAGEMENT_PUBLIC_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
 const clinics = [];
 if (env.ODIVON_CLINIC_URL || env.ODIVON_CLINIC_PUBLIC_KEY) {
  const code = env.ODIVON_CLINIC_CODE || 'local-clinic';
  if (!/^[a-z0-9][a-z0-9-]{2,47}$/.test(code)) throw new Error('Invalid clinic code.');
  clinics.push({code,...project(env.ODIVON_CLINIC_URL,env.ODIVON_CLINIC_PUBLIC_KEY)});
 }
 const turnstileSiteKey=env.ODIVON_TURNSTILE_SITE_KEY?.trim();
 if(requireTurnstile&&!turnstileSiteKey)throw new Error('ODIVON_TURNSTILE_SITE_KEY is required for production builds.');
 return {management,clinics,...(turnstileSiteKey ? {turnstileSiteKey} : {})};
}
if (import.meta.main) {
 const config = configuration(process.env,{requireTurnstile:process.argv.includes('--production')});
 await mkdir('src/assets',{recursive:true});
 await writeFile('src/assets/odivon-config.json',JSON.stringify(config,null,2));
 console.log('Public Odivon configuration generated.');
}
