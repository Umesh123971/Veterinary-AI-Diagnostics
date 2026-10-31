import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:180000,workers:1,fullyParallel:false,
 use:{baseURL:process.env.E2E_BASE_URL||'http://localhost:5173',channel:'msedge',headless:true,viewport:{width:1440,height:1000},screenshot:'only-on-failure',trace:'retain-on-failure'},
 expect:{timeout:20000},reporter:'list'});
