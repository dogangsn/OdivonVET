import test from 'node:test';
import assert from 'node:assert/strict';
import {configuration} from '../scripts/configure.mjs';
const env={NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'};
test('hosting aliases, explicit precedence and clinic directory defaults',()=>{
 assert.equal(configuration(env).management.url,env.NEXT_PUBLIC_SUPABASE_URL);
 assert.deepEqual(configuration(env).clinics,[]);
 assert.equal(configuration({...env,ODIVON_MANAGEMENT_URL:'http://127.0.0.1:54321'}).management.url,'http://127.0.0.1:54321');
});
test('missing, invalid and secret configuration cannot be published',()=>{
 for(const changes of [{NEXT_PUBLIC_SUPABASE_URL:''},{NEXT_PUBLIC_SUPABASE_URL:'http://example.com'},{NEXT_PUBLIC_SUPABASE_URL:'https://user:password@example.com'},{NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_secret_test'},{NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'replace-me'},{ODIVON_MANAGEMENT_PUBLIC_KEY:''}])assert.throws(()=>configuration({...env,...changes}));
 assert.throws(()=>configuration({}));
 const key='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.signature';
 assert.throws(()=>configuration({...env,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:key}));
});
