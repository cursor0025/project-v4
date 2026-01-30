// src/lib/search/types.ts

export type Lang = 'fr' | 'ar';

export interface ProductSearchDoc {
  id: string;

  // Bilingue
  name_fr: string;
  name_ar: string;
  description_fr: string;
  description_ar: string;

  // Taxonomie
  category: string;
  subcategory: string | null;

  // Mots-clés / tags (FR & AR, pour la recherche)
  tags: string[];

  // Métadonnées utiles
  wilaya: string | null;
  price: number;
  price_type: 'fixe' | 'negociable' | 'facilite';
  status: 'active' | 'inactive' | 'sold' | 'draft';

  // Pour le ranking
  views: number;
  created_at: string; // ISO string
  stock: number;

  // Vendeur
  vendor_id: string;
  vendor_name: string;
}
