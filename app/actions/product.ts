// app/actions/product.ts
'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * ACTION 1 : Créer un nouveau produit
 */
export async function createProduct(formData: {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  vendor_id: string;
}) {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category: formData.category,
        vendor_id: formData.vendor_id,
      },
    ])
    .select()

  if (error) {
    console.error('Erreur Supabase:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * ACTION 2 : Récupérer les produits d'un vendeur spécifique
 */
export async function getVendorProducts(vendorId: string) {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération:', error.message)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data }
}