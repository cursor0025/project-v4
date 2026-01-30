// ================================================================
// BZMARKET - TYPES POUR SYSTÈME D'ATTRIBUTS DYNAMIQUES
// ================================================================

export type AttributeType = 'text' | 'number' | 'select' | 'color' | 'checkbox';

export interface ColorOption {
  label: string;
  value: string; // Code hexadécimal (ex: "#FF0000")
}

export interface AttributeConfig {
  label: string;
  type: AttributeType;
  options?: string[] | ColorOption[]; // Array simple pour select, objets pour color
  is_variant: boolean;
  required: boolean;
  placeholder?: string;
  suffix?: string; // Ex: "Go", "cm", "kg"
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  description?: string;
  attributes_config: AttributeConfig[] | null;
  icon?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductAttributes {
  [key: string]: string | number | boolean;
}

export interface ProductVariant {
  id?: string;
  sku?: string;
  attributes: ProductAttributes; // Ex: { "Taille": "M", "Couleur": "#FF0000" }
  stock: number;
  price_adjustment?: number; // Surcoût par rapport au prix de base
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id?: number;
  subcategory_id: number;
  owner_id: string;
  attributes: ProductAttributes; // Attributs non-variants
  variants?: ProductVariant[]; // Variantes si attributs is_variant=true
  created_at: string;
  updated_at: string;
}
