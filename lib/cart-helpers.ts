import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { CartItem } from '@/store/cart';

const supabase = createSupabaseBrowserClient();

// Charger le panier depuis Supabase
export async function loadCartFromDB(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Erreur chargement panier:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    product_id: item.product_id,
    vendor_id: item.vendor_id,
    vendor_name: item.vendor_name,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    weight: item.weight,
    image_url: item.image_url,
    max_stock: item.max_stock,
  }));
}

// Ajouter un produit au panier
export async function addToCartDB(userId: string, item: Omit<CartItem, 'id' | 'quantity'>) {
  // Vérifier si le produit existe déjà
  const { data: existing } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', item.product_id)
    .single();

  if (existing) {
    // Incrémenter la quantité
    const newQuantity = Math.min(existing.quantity + 1, item.max_stock);
    const { error } = await supabase
      .from('carts')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) console.error('Erreur mise à jour panier:', error);
  } else {
    // Ajouter le produit
    const { error } = await supabase
      .from('carts')
      .insert({
        user_id: userId,
        product_id: item.product_id,
        vendor_id: item.vendor_id,
        vendor_name: item.vendor_name,
        name: item.name,
        price: item.price,
        quantity: 1,
        weight: item.weight,
        image_url: item.image_url,
        max_stock: item.max_stock,
      });

    if (error) console.error('Erreur ajout panier:', error);
  }
}

// Mettre à jour la quantité
export async function updateCartQuantityDB(userId: string, productId: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCartDB(userId, productId);
  }

  const { error } = await supabase
    .from('carts')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) console.error('Erreur mise à jour quantité:', error);
}

// Supprimer un produit
export async function removeFromCartDB(userId: string, productId: string) {
  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) console.error('Erreur suppression panier:', error);
}

// Vider le panier complet
export async function clearCartDB(userId: string) {
  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('user_id', userId);

  if (error) console.error('Erreur vidage panier:', error);
}

// Vider le panier d'un vendeur
export async function clearVendorCartDB(userId: string, vendorId: string) {
  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('user_id', userId)
    .eq('vendor_id', vendorId);

  if (error) console.error('Erreur vidage panier vendeur:', error);
}
