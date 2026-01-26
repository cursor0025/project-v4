'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentUserId } from './auth';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------
// 1. AJOUTER UN PRODUIT AU PANIER
// ---------------------------------------------------------
export async function addToCartDB(productId: string, quantity: number = 1) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { 
        success: false, 
        error: 'Non authentifié',
        requiresAuth: true 
      };
    }

    const supabase = await createClient();

    // Vérifier si le produit existe déjà dans le panier
    const { data: existingItem, error: checkError } = await supabase
      .from('cart')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur vérification panier:', checkError);
      return { success: false, error: checkError.message };
    }

    // Si le produit existe déjà, incrémenter la quantité
    if (existingItem) {
      const { error: updateError } = await supabase
        .from('cart')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error('Erreur mise à jour quantité:', updateError);
        return { success: false, error: updateError.message };
      }

      revalidatePath('/cart');
      return { success: true, message: 'Quantité mise à jour' };
    }

    // Sinon, créer une nouvelle ligne
    const { error: insertError } = await supabase
      .from('cart')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity: quantity,
      });

    if (insertError) {
      console.error('Erreur ajout panier:', insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath('/cart');
    return { success: true, message: 'Produit ajouté au panier' };

  } catch (error) {
    console.error('Erreur inattendue addToCartDB:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

// ---------------------------------------------------------
// 2. METTRE À JOUR LA QUANTITÉ D'UN PRODUIT
// ---------------------------------------------------------
export async function updateCartQuantityDB(productId: string, quantity: number) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { 
        success: false, 
        error: 'Non authentifié',
        requiresAuth: true 
      };
    }

    const supabase = await createClient();

    // Si quantité = 0, supprimer
    if (quantity <= 0) {
      return await removeFromCartDB(productId);
    }

    // Sinon, mettre à jour
    const { error } = await supabase
      .from('cart')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Erreur mise à jour quantité:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/cart');
    return { success: true, message: 'Quantité mise à jour' };

  } catch (error) {
    console.error('Erreur inattendue updateCartQuantityDB:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

// ---------------------------------------------------------
// 3. SUPPRIMER UN PRODUIT DU PANIER
// ---------------------------------------------------------
export async function removeFromCartDB(productId: string) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { 
        success: false, 
        error: 'Non authentifié',
        requiresAuth: true 
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Erreur suppression panier:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/cart');
    return { success: true, message: 'Produit retiré du panier' };

  } catch (error) {
    console.error('Erreur inattendue removeFromCartDB:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

// ---------------------------------------------------------
// 4. CHARGER LE PANIER DE L'UTILISATEUR (AVEC INFOS PRODUIT + VENDEUR)
// ---------------------------------------------------------
export async function loadUserCart() {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { 
        success: false, 
        items: [],
        error: 'Non authentifié',
        requiresAuth: true 
      };
    }

    const supabase = await createClient();

    // ✅ CORRIGÉ : shop_name et shop_logo au lieu de business_name et logo_url
    const { data, error } = await supabase
      .from('cart')
      .select(`
        id,
        product_id,
        quantity,
        products!inner (
          id,
          name,
          price,
          stock,
          images,
          vendor_id,
          vendors!inner (
            id,
            shop_name,
            shop_logo
          )
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur chargement panier:', error);
      return { success: false, items: [], error: error.message };
    }

    // ✅ CORRIGÉ : shop_name et shop_logo
    const items = data?.map((item: any) => ({
      cart_id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      name: item.products?.name || 'Produit',
      price: item.products?.price || 0,
      max_stock: item.products?.stock || 0,
      image_url: item.products?.images?.[0] || null,
      vendor_id: item.products?.vendor_id || '',
      vendor_name: item.products?.vendors?.shop_name || 'Vendeur',
      vendor_logo: item.products?.vendors?.shop_logo || null,
    })) || [];

    return { success: true, items };

  } catch (error) {
    console.error('Erreur inattendue loadUserCart:', error);
    return { success: false, items: [], error: 'Erreur inattendue' };
  }
}

// ---------------------------------------------------------
// 5. OBTENIR LE NOMBRE D'ARTICLES DANS LE PANIER
// ---------------------------------------------------------
export async function getCartCount() {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { success: false, count: 0 };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cart')
      .select('quantity')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur comptage panier:', error);
      return { success: false, count: 0 };
    }

    const count = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    
    return { success: true, count };

  } catch (error) {
    console.error('Erreur inattenue getCartCount:', error);
    return { success: false, count: 0 };
  }
}

// ---------------------------------------------------------
// 6. VIDER LE PANIER (Après commande validée)
// ---------------------------------------------------------
export async function clearUserCart() {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { 
        success: false, 
        error: 'Non authentifié',
        requiresAuth: true 
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur vidage panier:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/cart');
    return { success: true, message: 'Panier vidé' };

  } catch (error) {
    console.error('Erreur inattendue clearUserCart:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

// ---------------------------------------------------------
// 7. VÉRIFIER SI UN PRODUIT EST DANS LE PANIER
// ---------------------------------------------------------
export async function isProductInCart(productId: string) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return { success: false, inCart: false };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cart')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur vérification produit:', error);
      return { success: false, inCart: false };
    }

    return { 
      success: true, 
      inCart: !!data,
      quantity: data?.quantity || 0
    };

  } catch (error) {
    console.error('Erreur inattendue isProductInCart:', error);
    return { success: false, inCart: false };
  }
}
