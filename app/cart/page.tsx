'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadUserCart,
  updateCartQuantityDB,
  removeFromCartDB,
} from '@/app/actions/cart-db';
import { checkAuth } from '@/app/actions/auth';
import { useCartStore } from '@/store/cart';
import CartHeader from '@/components/CartHeader';
import {
  Store,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Package,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();

  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const updateItemLocally = useCartStore((state) => state.updateItemLocally);
  const removeItemLocally = useCartStore((state) => state.removeItemLocally);
  const itemsByVendor = useCartStore((state) => state.itemsByVendor);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { isAuth } = await checkAuth();

      if (!isAuth) {
        toast.error('Connectez-vous pour accéder au panier', {
          icon: <LogIn className="w-4 h-4" />,
        });
        router.push('/login?redirect=/cart');
        return;
      }

      const result = await loadUserCart();

      if (result.requiresAuth) {
        router.push('/login?redirect=/cart');
        return;
      }

      if (!result.success) {
        toast.error('Erreur lors du chargement du panier');
        setItems([]);
        setIsLoading(false);
        return;
      }

      setItems(result.items || []);
      setIsLoading(false);
    }

    init();
  }, [router, setItems]);

  const handleIncrement = async (
    productId: string,
    currentQty: number,
    maxStock: number
  ) => {
    if (currentQty >= maxStock) {
      toast.error('Stock maximum atteint');
      return;
    }

    const newQty = currentQty + 1;
    updateItemLocally(productId, newQty);

    const result = await updateCartQuantityDB(productId, newQty);

    if (!result.success) {
      updateItemLocally(productId, currentQty);
      toast.error(result.error || 'Erreur mise à jour');
    }
  };

  const handleDecrement = async (productId: string, currentQty: number) => {
    if (currentQty > 1) {
      const newQty = currentQty - 1;
      updateItemLocally(productId, newQty);

      const result = await updateCartQuantityDB(productId, newQty);

      if (!result.success) {
        updateItemLocally(productId, currentQty);
        toast.error(result.error || 'Erreur mise à jour');
      }
    } else {
      // quantité 1 -> suppression
      removeItemLocally(productId);

      const result = await removeFromCartDB(productId);

      if (result.success) {
        toast.info('Produit retiré du panier');
      } else {
        toast.error('Erreur suppression');
        const cartResult = await loadUserCart();
        if (cartResult.success) {
          setItems(cartResult.items || []);
        }
      }
    }
  };

  const calculateVendorTotal = (vendorId: string) => {
    return items
      .filter((item) => item.vendor_id === vendorId)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const vendorCount = Object.keys(itemsByVendor()).length;

  if (isLoading) {
    return (
      <>
        <CartHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <CartHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-6">
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Découvrir les produits
            </a>
          </div>
        </div>
      </>
    );
  }

  const grouped = itemsByVendor();

  return (
    <>
      <CartHeader />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Votre panier
            </h1>
            <p className="text-gray-600">
              {totalItems} article{totalItems > 1 ? 's' : ''} · {vendorCount}{' '}
              vendeur{vendorCount > 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(grouped).map(([vendorId, vendorItems]) => {
                const firstItem = vendorItems[0];
                const vendorTotal = calculateVendorTotal(vendorId);

                return (
                  <div
                    key={vendorId}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {firstItem.vendor_logo ? (
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <img
                              src={firstItem.vendor_logo}
                              alt={firstItem.vendor_name}
                              className="w-12 h-12 object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                            <Store className="w-6 h-6 text-orange-600" />
                          </div>
                        )}
                        <div>
                          <h2 className="text-white font-bold text-lg">
                            {firstItem.vendor_name}
                          </h2>
                          <p className="text-orange-100 text-sm">
                            {vendorItems.length} article
                            {vendorItems.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-xl">
                          {vendorTotal.toLocaleString()} DA
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {vendorItems.map((item) => (
                        <div
                          key={item.product_id}
                          className="p-6 flex gap-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              {item.price.toLocaleString()} DA · Stock max{' '}
                              {item.max_stock}
                            </p>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center border-2 border-gray-200 rounded-lg">
                                <button
                                  onClick={() =>
                                    handleDecrement(
                                      item.product_id,
                                      item.quantity
                                    )
                                  }
                                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                >
                                  {item.quantity === 1 ? (
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  ) : (
                                    <Minus className="w-4 h-4 text-gray-700" />
                                  )}
                                </button>

                                <span className="px-4 py-2 font-bold text-gray-900 min-w-[50px] text-center">
                                  {item.quantity}
                                </span>

                                <button
                                  onClick={() =>
                                    handleIncrement(
                                      item.product_id,
                                      item.quantity,
                                      item.max_stock
                                    )
                                  }
                                  disabled={item.quantity >= item.max_stock}
                                  className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-4 h-4 text-gray-700" />
                                </button>
                              </div>

                              <span className="font-bold text-lg text-gray-900">
                                {(item.price * item.quantity).toLocaleString()}{' '}
                                DA
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-6 py-4 bg-gray-50">
                      <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Commander chez {firstItem.vendor_name} (
                        {vendorTotal.toLocaleString()} DA)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Récapitulatif
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Articles ({totalItems})</span>
                    <span className="font-semibold">
                      {totalAmount.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Livraison</span>
                    <span className="text-sm text-green-600 font-medium">
                      Calculée plus tard
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      {totalAmount.toLocaleString()} DA
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    💡 Les frais de livraison seront calculés lors de la
                    validation de chaque commande.
                  </p>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Vous commandez auprès de {vendorCount} vendeur
                  {vendorCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
