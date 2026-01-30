// scripts/env-loader.ts
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.join(process.cwd(), '.env.local');

dotenv.config({ path: envPath });

console.log('Loaded env from', envPath);
console.log('MEILI_HOST =', process.env.MEILI_HOST);
console.log('MEILI_MASTER_KEY =', process.env.MEILI_MASTER_KEY);
console.log('MEILI_INDEX_PRODUCTS =', process.env.MEILI_INDEX_PRODUCTS);
