// scripts/configure-meili.ts
// Script simple pour configurer l'index Meilisearch

import { configureProductsIndex } from '../lib/search/configure-products-index';

async function main() {
  try {
    await configureProductsIndex();
    console.log('✅ Configuration terminée');
  } catch (e) {
    console.error('❌ Erreur configuration Meilisearch:', e);
    process.exit(1);
  }
}

main();
