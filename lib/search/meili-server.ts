// lib/search/meili-server.ts
import { MeiliSearch } from 'meilisearch';

const host = process.env.MEILI_HOST;
const apiKey = process.env.MEILI_MASTER_KEY;

if (!host) {
  throw new Error('MEILI_HOST is not defined');
}

export const meiliClient = new MeiliSearch({
  host,
  apiKey,
});

export const productsIndex = meiliClient.index(
  process.env.MEILI_INDEX_PRODUCTS ?? 'products'
);
