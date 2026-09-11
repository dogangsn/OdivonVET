import test from 'node:test';
import assert from 'node:assert/strict';
import {authConfig,checksum,managementMigrationQuery,managementSecrets,requiredDeploymentEnv,vaultUpsertSql} from '../scripts/lib/management-deployment.mjs';

const valid={
 SUPABASE_ACCESS_TOKEN:'sbp_test',ODIVON_ORGANIZATION_SLUG:'odivon',ODIVON_TURNSTILE_SECRET:'turnstile-secret',
 ODIVON_WORKER_TOKEN:'w'.repeat(32),ODIVON_CLINIC_WORKER_MASTER:'c'.repeat(32),ODIVON_ACTIVATION_TOKEN:'a'.repeat(32),
 ODIVON_SMTP_HOST:'smtp.example.test',ODIVON_SMTP_PORT:'587',ODIVON_SMTP_USER:'user',ODIVON_SMTP_PASSWORD:'password',ODIVON_SMTP_FROM:'support@example.test'
};

test('management deployment requires secrets and applies safe production defaults',()=>{
 assert.throws(()=>requiredDeploymentEnv({}),/Missing deployment environment/);
 assert.throws(()=>requiredDeploymentEnv({...valid,ODIVON_WORKER_TOKEN:'short'}),/at least 32/);
 const env=requiredDeploymentEnv(valid);
 assert.equal(env.ODIVON_MANAGEMENT_PROJECT_REF,'bchqsyqimcudbybdovjx');
 assert.equal(env.ODIVON_APP_ORIGIN,'https://vet.odivon.com');
 const auth=authConfig(env);
 assert.equal(auth.mailer_autoconfirm,true);assert.equal(auth.password_min_length,12);
 assert.equal(auth.security_captcha_provider,'turnstile');assert.equal(auth.security_captcha_enabled,true);
 assert.equal(managementSecrets(env).some(item=>item.name==='WORKER_TOKEN'&&item.value===env.ODIVON_WORKER_TOKEN),true);
});

test('SMTP is optional until invitation delivery is configured',()=>{
 const withoutSmtp=Object.fromEntries(Object.entries(valid).filter(([name])=>!name.startsWith('ODIVON_SMTP_')));
 const env=requiredDeploymentEnv(withoutSmtp);
 assert.equal('smtp_host' in authConfig(env),false);
 assert.equal(managementSecrets(env).some(item=>item.name.startsWith('SMTP_')),false);
});

test('management migrations are checksum tracked and escape SQL safely',()=>{
 const sql="select 'clinic';";const query=managementMigrationQuery('001_test',sql);
 assert.match(query,new RegExp(checksum(sql)));assert.match(query,/checksum mismatch/);assert.match(query,/select ''clinic''/);
});

test('scheduler vault update is idempotent and quotes secret values',()=>{
 const sql=vaultUpsertSql('https://project.supabase.co',"worker'token");
 assert.match(sql,/vault\.update_secret/);assert.match(sql,/worker''token/);assert.doesNotMatch(sql,/\$1|\$2/);
});
