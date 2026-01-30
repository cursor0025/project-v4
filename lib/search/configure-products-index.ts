// lib/search/configure-products-index.ts

import { productsIndex } from './meili-server';

export async function configureProductsIndex() {
  // 1) Attributs de recherche
  await productsIndex.updateSearchableAttributes([
    'name_fr',
    'name_ar',
    'description_fr',
    'description_ar',
    'tags',
  ]);

  // 2) Attributs filtrables
  await productsIndex.updateFilterableAttributes([
    'category',
    'subcategory',
    'wilaya',
    'price_type',
    'status',
    'vendor_id',
  ]);

  // 3) Attributs triables
  await productsIndex.updateSortableAttributes([
    'price',
    'views',
    'created_at',
  ]);

  // 4) Ranking Rules
  // On garde les built-in, puis on ajoute des custom ranking rules au bon format
  await productsIndex.updateRankingRules([
    'typo',
    'words',
    'proximity',
    'attribute',
    'sort',
    'exactness',
    'views:desc',
    'created_at:desc',
  ]);

  // 5) Typo tolerance (fuzzy)
  await productsIndex.updateTypoTolerance({
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 8,
    },
    disableOnWords: [],
    disableOnAttributes: [],
  });

  // 6) Stop words FR + AR
  await productsIndex.updateStopWords([
    'le','la','les','de','des','du','un','une','et','ou','pour',
    'avec','dans','sur','au','aux','ce','ces','cet','cette',
    'ال','من','على','في','عن','الى','إلى','و','او','أو','هذا',
    'هذه','ذلك','تلك',
  ]);

  // 7) Synonymes FR/AR
  await productsIndex.updateSynonyms({
    paracetamol: ['doliprane', 'dafalgan', 'باراسيتامول'],
    doliprane: ['paracetamol', 'dafalgan', 'باراسيتامول'],
    'باراسيتامول': ['paracetamol', 'doliprane', 'dafalgan'],

    aspirine: ['aspirin', 'اسبرين'],
    aspirin: ['aspirine', 'اسبرين'],
    'اسبرين': ['aspirine', 'aspirin'],

    telephone: ['smartphone', 'gsm', 'هاتف'],
    smartphone: ['telephone', 'gsm', 'هاتف'],
    'هاتف': ['telephone', 'smartphone', 'gsm'],
  });

  console.log('✅ Meilisearch products index configured');
}
