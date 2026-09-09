-- Run once in the management project after configuring the two Vault secrets in its dashboard:
-- odivon_management_url = project URL, odivon_worker_token = WORKER_TOKEN (server secret).
-- No secret values belong in this version-controlled file.
create extension if not exists pg_cron;
create extension if not exists pg_net;
do $$ declare j record;begin
 for j in select jobid from cron.job where jobname in ('odivon-provisioning','odivon-maintenance') loop perform cron.unschedule(j.jobid);end loop;
end $$;
select cron.schedule('odivon-provisioning','* * * * *', $job$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='odivon_management_url')||'/functions/v1/clinic-provisioner',
  headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='odivon_worker_token')),
  body := '{}'::jsonb,timeout_milliseconds := 55000
 );
$job$);
select cron.schedule('odivon-maintenance','* * * * *', $job$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='odivon_management_url')||'/functions/v1/clinic-maintenance',
  headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='odivon_worker_token')),
  body := '{}'::jsonb,timeout_milliseconds := 55000
 );
$job$);
