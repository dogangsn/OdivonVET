import {createHash} from 'node:crypto';

export const MANAGEMENT_FUNCTIONS=['clinic-directory','clinic-provisioner','clinic-maintenance','clinic-activate'];

export function checksum(source){return createHash('sha256').update(source).digest('hex');}

function quote(value){return "'"+String(value).replaceAll("'","''")+"'";}

export function managementMigrationQuery(version,sql){
 const hash=checksum(sql);
 return `begin;
create schema if not exists private;
create table if not exists private.odivon_management_migrations(version text primary key,checksum text not null,applied_at timestamptz not null default now());
select pg_advisory_xact_lock(9060903);
do $odivon$ begin
 if exists(select 1 from private.odivon_management_migrations where version=${quote(version)} and checksum<>${quote(hash)}) then raise exception 'Management migration checksum mismatch: ${version}';end if;
 if not exists(select 1 from private.odivon_management_migrations where version=${quote(version)}) then
  execute ${quote(sql)};
  insert into private.odivon_management_migrations(version,checksum) values(${quote(version)},${quote(hash)});
 end if;
end $odivon$;
commit;`;
}

export function authConfig(env){
 const origin=env.ODIVON_APP_ORIGIN;
 return {
  site_url:origin,
  uri_allow_list:[origin+'/auth/callback',origin+'/auth/registration',origin+'/auth/reset-password'].join(','),
  disable_signup:false,
  external_email_enabled:true,
  mailer_autoconfirm:true,
  password_min_length:12,
  security_captcha_enabled:true,
  security_captcha_provider:'turnstile',
  security_captcha_secret:env.ODIVON_TURNSTILE_SECRET,
  smtp_host:env.ODIVON_SMTP_HOST,
  smtp_port:env.ODIVON_SMTP_PORT,
  smtp_user:env.ODIVON_SMTP_USER,
  smtp_pass:env.ODIVON_SMTP_PASSWORD,
  smtp_admin_email:env.ODIVON_SMTP_FROM,
  smtp_sender_name:'Odivon Vet'
 };
}

export function requiredDeploymentEnv(env){
 const defaults={ODIVON_MANAGEMENT_PROJECT_REF:'bchqsyqimcudbybdovjx',ODIVON_APP_ORIGIN:'https://vet.odivon.com',ODIVON_SUPABASE_REGION:'eu-central-1'};
 const values={...defaults,...env};
 const required=['SUPABASE_ACCESS_TOKEN','ODIVON_ORGANIZATION_SLUG','ODIVON_WORKER_TOKEN','ODIVON_CLINIC_WORKER_MASTER','ODIVON_ACTIVATION_TOKEN','ODIVON_TURNSTILE_SECRET','ODIVON_SMTP_HOST','ODIVON_SMTP_PORT','ODIVON_SMTP_USER','ODIVON_SMTP_PASSWORD','ODIVON_SMTP_FROM'];
 const missing=required.filter(name=>!values[name]?.trim());
 if(missing.length)throw new Error('Missing deployment environment: '+missing.join(', '));
 if(!/^https:\/\//.test(values.ODIVON_APP_ORIGIN))throw new Error('ODIVON_APP_ORIGIN must use HTTPS.');
 for(const name of ['ODIVON_WORKER_TOKEN','ODIVON_CLINIC_WORKER_MASTER','ODIVON_ACTIVATION_TOKEN'])if(values[name].length<32)throw new Error(name+' must be at least 32 characters.');
 return values;
}

export function managementSecrets(env){return [
 {name:'APP_ORIGIN',value:env.ODIVON_APP_ORIGIN},
 {name:'SUPABASE_MANAGEMENT_TOKEN',value:env.SUPABASE_ACCESS_TOKEN},
 {name:'SUPABASE_ORGANIZATION_SLUG',value:env.ODIVON_ORGANIZATION_SLUG},
 {name:'SUPABASE_REGION',value:env.ODIVON_SUPABASE_REGION},
 {name:'WORKER_TOKEN',value:env.ODIVON_WORKER_TOKEN},
 {name:'CLINIC_WORKER_MASTER',value:env.ODIVON_CLINIC_WORKER_MASTER},
 {name:'ACTIVATION_TOKEN',value:env.ODIVON_ACTIVATION_TOKEN},
 {name:'SMTP_HOST',value:env.ODIVON_SMTP_HOST},
 {name:'SMTP_PORT',value:env.ODIVON_SMTP_PORT},
 {name:'SMTP_USER',value:env.ODIVON_SMTP_USER},
 {name:'SMTP_PASSWORD',value:env.ODIVON_SMTP_PASSWORD},
 {name:'SMTP_FROM',value:env.ODIVON_SMTP_FROM}
];}

export function vaultUpsertSql(managementUrl,workerToken){return `create extension if not exists supabase_vault with schema vault;
do $vault$ declare secret_id uuid; begin
 select id into secret_id from vault.decrypted_secrets where name='odivon_management_url';
 if secret_id is null then perform vault.create_secret(${quote(managementUrl)},'odivon_management_url','Odivon scheduler management URL');
 else perform vault.update_secret(secret_id,${quote(managementUrl)},'odivon_management_url','Odivon scheduler management URL');end if;
 select id into secret_id from vault.decrypted_secrets where name='odivon_worker_token';
 if secret_id is null then perform vault.create_secret(${quote(workerToken)},'odivon_worker_token','Odivon scheduler worker token');
 else perform vault.update_secret(secret_id,${quote(workerToken)},'odivon_worker_token','Odivon scheduler worker token');end if;
end $vault$;`;}
