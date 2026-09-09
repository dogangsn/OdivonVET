import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',outputDir:'.local/browser-results',fullyParallel:false,workers:1,reporter:'list',use:{baseURL:process.env.ODIVON_PREVIEW_URL||'http://127.0.0.1:4200',headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',viewport:{width:1440,height:1000}},timeout:30000});
