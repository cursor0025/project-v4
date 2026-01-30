import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const meiliHost = process.env.MEILI_HOST!;
const meiliKey = process.env.MEILI_MASTER_KEY!;
const meiliIndex = process.env.MEILI_INDEX_PRODUCTS || 'produits';

const supabase = createClient(supabaseUrl, supabaseKey);
const meili = new MeiliSearch({
  host: meiliHost,
  apiKey: meiliKey,
});

async function main() {
  console.log('Sync produits -> Meilisearch...');
  console.log('Index utilisé :', meiliIndex);

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active');

  if (error) {
    console.error('Erreur Supabase:', error);
    process.exit(1);
  }

  console.log(`Produits récupérés: ${products?.length || 0}`);

  if (!products || products.length === 0) {
    console.log('Aucun produit à indexer.');
    process.exit(0);
  }

  const index = meili.index(meiliIndex);
  const task = await index.addDocuments(products);
  console.log('Task Meili:', task);
  console.log('Terminé (attends que la tâche soit traitée dans le dashboard).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
