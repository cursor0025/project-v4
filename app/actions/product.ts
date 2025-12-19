// app/actions/product.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getCategories() {
  const supabase = await createServerSupabaseClient()

  // On récupère les catégories actives triées par ordre
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, parent_id, icon, slug')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Erreur chargement catégories:', error)
    return []
  }

  return data
}