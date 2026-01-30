import { NextRequest, NextResponse } from 'next/server';
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILI_HOST!,
  apiKey: process.env.MEILI_MASTER_KEY!,
});

const index = client.index(process.env.MEILI_INDEX_PRODUCTS || 'produits');

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q') ?? '';

    const result = await index.search(q, {
      limit: 20,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Erreur Meilisearch objet complet:', err);
    return NextResponse.json(
      { hits: [], error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
