'use client';

import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, Package, Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getGroupedByVendor, getVendorTotal } = useCartStore();
  const groupedItems = getGroupedByVendor();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors">
              <ArrowLeft size={20} />
              Retour à l'accueil
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Panier vide</h2>
            <p className="text-gray-600 mb-6">Votre panier est vide pour le moment</p>
            <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors">
            <ArrowLeft size={20} />
            Continuer mes achats
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([vendorId, vendorItems]) => {
            const vendorName = vendorItems[0]?.vendor_name || 'Vendeur';
            const vendorTotal = getVendorTotal(vendorId);

            return (
              <div key={vendorId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{vendorName}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-gray-900">{vendorTotal.toLocaleString()} DA</p>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {vendorItems.map((item) => (
                    <div key={item.product_id} className="p-6 flex gap-4">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-lg font-bold text-blue-600">{item.price.toLocaleString()} DA</p>
                        <p className="text-sm text-gray-500">{item.weight}kg</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-colors" disabled={item.quantity >= item.max_stock}>
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right w-32">
                        <p className="text-sm text-gray-600">Sous-total</p>
                        <p className="text-lg font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()} DA</p>
                      </div>
                      <button onClick={() => removeItem(item.product_id)} className="text-red-500 hover:text-red-700 p-2 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <button onClick={() => router.push(`/checkout/${vendorId}`)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Commander chez {vendorName} ({vendorTotal.toLocaleString()} DA)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
