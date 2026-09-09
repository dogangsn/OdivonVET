import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {legacyActions,ScopePermission} from './permissions';

export interface PublicClinicConfig { code: string; url: string; publishableKey: string; }
export interface OdivonConfig { management: {url: string; publishableKey: string}; clinics?: PublicClinicConfig[]; turnstileSiteKey?: string; }
export interface ClinicProfile { id: string; email: string; name: string; role: string; branch_id: string; active: boolean; }

@Injectable({providedIn:'root'})
export class ClinicClientService {
    private configPromise: Promise<OdivonConfig>;
    private instance: SupabaseClient;
    private managementInstance: SupabaseClient;
    private authSubscription: {unsubscribe(): void};
    entitled = false;
    code = '';
    profile: ClinicProfile;
    permissions:ScopePermission[]=[];
    async config(): Promise<OdivonConfig> {
        if (!this.configPromise) this.configPromise = fetch('/assets/odivon-config.json').then(async r => {
            if (!r.ok) throw new Error('Klinik bağlantısı henüz hazırlanmadı. Lütfen Odivon desteğiyle iletişime geçin.');
            return r.json();
        }).catch(e => { this.configPromise=undefined; throw e; });
        return this.configPromise;
    }
    async management(): Promise<SupabaseClient> {
        if (!this.managementInstance) { const c=await this.config(); this.managementInstance=createClient(c.management.url,c.management.publishableKey,{auth:{storageKey:'odivon-management',flowType:'pkce'}}); }
        return this.managementInstance;
    }
    async connect(code: string): Promise<SupabaseClient> {
        code=(code || '').trim().toLowerCase();
        if (!/^[a-z0-9][a-z0-9-]{2,47}$/.test(code)) throw new Error('Geçerli klinik kodunu girin.');
        if (this.instance && this.code===code) return this.instance;
        const config=await this.config();
        let clinic=config.clinics?.find(c=>c.code===code);
        if (!clinic) {
            const result=await (await this.management()).functions.invoke('clinic-directory',{body:{code}});
            if (result.error || !result.data?.url) throw new Error('Klinik bulunamadı veya kurulumu tamamlanmadı.');
            clinic=result.data;
        }
        if (this.instance) { this.authSubscription?.unsubscribe(); await this.instance.removeAllChannels(); this.instance.auth.stopAutoRefresh(); }
        this.profile=undefined; this.permissions=[]; this.entitled=false; this.code=code;
        this.instance=createClient(clinic.url,clinic.publishableKey,{auth:{storageKey:'odivon-clinic-'+code,flowType:'pkce',detectSessionInUrl:true}});
        localStorage.setItem('odivon-clinic-code',code);
        this.authSubscription=this.instance.auth.onAuthStateChange((event, session)=>{
            // Compatibility cache for old display helpers only. Authorization remains server-side.
            if (session) localStorage.setItem('accessToken',session.access_token);
            else { this.profile=undefined;this.permissions=[];this.entitled=false;localStorage.removeItem('accessToken'); localStorage.removeItem('odivon-profile');localStorage.removeItem('actions'); }
        }).data.subscription;
        return this.instance;
    }
    async client(): Promise<SupabaseClient> { return this.connect(this.code || localStorage.getItem('odivon-clinic-code')); }
    async loadProfile(): Promise<ClinicProfile> {
        const db=await this.client(); const {data:{user},error:authError}=await db.auth.getUser();
        if(authError || !user) throw new Error('Oturum açın.');
        const {data,error}=await db.from('profiles').select('*').eq('id',user.id).single();
        if(error || !data?.active) throw new Error('Klinik üyeliği bulunamadı veya kapatılmış.');
        const permissions=await db.rpc('session_permissions');if(permissions.error)throw permissions.error;
        const access=await db.rpc('session_entitlement');if(access.error)throw access.error;this.entitled=access.data===true;
        this.permissions=permissions.data;localStorage.setItem('actions',JSON.stringify(legacyActions(this.permissions)));
        this.profile=data; localStorage.setItem('odivon-profile',JSON.stringify(data)); return data;
    }
}
