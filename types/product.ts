// types/product.ts
export interface Product {
    id: string;
    vendor_id: string;
    name: string;
    description: string | null;
    price: number;
    old_price: number | null;
    category: string;
    subcategory: string | null;
    stock: number;
    images: string[];
    metadata: Record<string, any>;
    delivery_available: boolean;
    price_type: 'fixe' | 'negociable' | 'facilite';
    status: 'active' | 'inactive' | 'sold' | 'draft';
    created_at: string;
    updated_at: string;
    views?: number;
    rating?: number;
    reviews_count?: number;
  }
  
  export interface ProductFilters {
    wilaya?: string;
    etat?: string;
    priceType?: 'fixe' | 'negociable' | 'facilite';
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  }
  
  export const WILAYAS = [
    'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 
    'Sétif', 'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda', 
    'Tiaret', 'Béjaïa', 'Tlemcen', 'Ouargla', 'Béchar', 'Mostaganem', 
    'Bordj Bou Arreridj', 'Chlef', 'Souk Ahras', 'El Tarf', 'Jijel', 
    'Guelma', 'Laghouat', 'Mascara', 'M\'Sila', 'Médéa', 'Saïda', 
    'Ain Defla', 'Naâma', 'Ain Témouchent', 'Ghardaïa', 'Relizane', 
    'Tindouf', 'Tissemsilt', 'El Bayadh', 'Illizi', 'Khenchela', 
    'Mila', 'Ouled Djellal', 'Bordj Badji Mokhtar', 'Béni Abbès', 
    'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
  ];
  