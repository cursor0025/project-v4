'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getVendorsInfo(vendorIds: string[]) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('id, business_name, logo_url')
      .in('id', vendorIds);

    if (error) {
      console.error('Erreur récupération vendeurs:', error);
      return {};
    }

    // Convertir en objet pour un accès rapide par ID
    const vendorsMap: Record<string, { business_name: string; logo_url: string | null }> = {};
    
    vendors?.forEach((vendor) => {
      vendorsMap[vendor.id] = {
        business_name: vendor.business_name,
        logo_url: vendor.logo_url,
      };
    });

    return vendorsMap;
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return {};
  }
}
