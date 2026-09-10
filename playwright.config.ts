import {defineConfig} from '@playwright/test';
const baseURL=process.env.ODIVON_PREVIEW_URL||'http://127.0.0.1:4200';
export default defineConfig({testDir:'./tests/browser',outputDir:'.local/browser-results',fullyParallel:false,workers:1,reporter:'list',webServer:process.env.ODIVON_PREVIEW_URL?undefined:{command:'npm start -- --host 127.0.0.1',url:baseURL,reuseExistingServer:true,timeout:300000},use:{baseURL,headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',viewport:{width:1440,height:1000}},timeout:30000});
