'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export type DbCartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string | null;
  updated_at: string | null;
};

export type VendorCartGroup = {
  vendor_id: string;
  business_name: string | null;
  items: Array<{
    cart_id: string;
    product_id: string;
    name: string;
    image_url: string | null;
    price: number;
    stock: number;
    quantity: number;
  }>;
  subtotal: number;
};

/**
 * Récupère le panier de l'utilisateur connecté, groupé par vendeur.
 */
export async function getUserCartGroupedByVendor(): Promise<VendorCartGroup[]> {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from('cart')
    .select(
      `
      id,
      user_id,
      product_id,
      quantity,
      products (
        id,
        name,
        price,
        stock,
        images,
        vendor_id
      )
    `
    )
    .eq('user_id', user.id);

  if (error || !data) {
    console.error('Erreur chargement panier:', error);
    return [];
  }

  const products = await supabase
    .from('products')
    .select('id, vendor_id');

  // On récupère les vendeurs (business_name) à partir de profiles
  const vendorIds = Array.from(
    new Set(
      data
        .map((row: any) => row.products?.vendor_id)
        .filter((v: string | null) => !!v)
    )
  );

  let vendorsMap = new Map<string, { business_name: string | null }>();

  if (vendorIds.length > 0) {
    const { data: vendorsData, error: vendorsError } = await supabase
      .from('profiles')
      .select('id, business_name')
      .in('id', vendorIds);

    if (!vendorsError && vendorsData) {
      vendorsMap = new Map(
        vendorsData.map((v) => [v.id, { business_name: v.business_name }])
      );
    }
  }

  const groupsMap = new Map<string, VendorCartGroup>();

  for (const row of data as any[]) {
    const product = row.products;
    if (!product) continue;

    const vendorId = product.vendor_id as string;
    if (!vendorId) continue;

    if (!groupsMap.has(vendorId)) {
      const vendorInfo = vendorsMap.get(vendorId);
      groupsMap.set(vendorId, {
        vendor_id: vendorId,
        business_name: vendorInfo?.business_name || 'Vendeur',
        items: [],
        subtotal: 0,
      });
    }

    const group = groupsMap.get(vendorId)!;

    const price = product.price ?? 0;
    const qty = row.quantity ?? 1;

    group.items.push({
      cart_id: row.id,
      product_id: product.id,
      name: product.name,
      image_url:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : null,
      price,
      stock: product.stock ?? 0,
      quantity: qty,
    });

    group.subtotal += price * qty;
  }

  return Array.from(groupsMap.values());
}

/**
 * Ajoute un produit au panier, en incrémentant la quantité si la ligne existe déjà.
 */
export async function addItemToCart(productId: string, quantity = 1) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('NON_AUTHENTICATED');
  }

  const { data: existing, error: existingError } = await supabase
    .from('cart')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existingError) {
    console.error('Erreur lecture panier:', existingError);
    throw existingError;
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('cart')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Erreur mise à jour panier:', updateError);
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabase.from('cart').insert({
      user_id: user.id,
      product_id: productId,
      quantity,
    });

    if (insertError) {
      console.error('Erreur insertion panier:', insertError);
      throw insertError;
    }
  }
}

/**
 * Met à jour la quantité d'une ligne (par exemple +1 / -1).
 */
export async function updateCartItemQuantity(cartId: string, quantity: number) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('NON_AUTHENTICATED');

  if (quantity <= 0) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur suppression ligne panier:', error);
      throw error;
    }

    return;
  }

  const { error } = await supabase
    .from('cart')
    .update({ quantity })
    .eq('id', cartId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Erreur update ligne panier:', error);
    throw error;
  }
}

/**
 * Supprime une ligne de panier.
 */
export async function removeCartItem(cartId: string) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('NON_AUTHENTICATED');

  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', cartId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Erreur suppression ligne panier:', error);
    throw error;
  }
}

/**
 * Vide tout le panier de l'utilisateur (utile après une commande).
 */
export async function clearUserCart() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Erreur vidage panier:', error);
    throw error;
  }
}
