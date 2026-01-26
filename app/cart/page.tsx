'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { getVendors, items, updateQuantity, removeItem } = useCartStore();

  const vendorGroups = getVendors();
  const total = vendorGroups.reduce((sum, v) => sum + v.subtotal, 0);

  if (items.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">Votre panier</h1>
        <p className="text-gray-600 mb-6">
          Votre panier est vide. Ajoutez des produits depuis la page d’accueil.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700"
        >
          Continuer vos achats
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Votre panier</h1>
        <span className="text-lg font-semibold text-orange-600">
          Total: {total.toLocaleString('fr-DZ')} DA
        </span>
      </header>

      {vendorGroups.map((vendor) => (
        <section
          key={vendor.vendor_id}
          className="border border-gray-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              {vendor.vendor_name || 'Boutique'}
            </h2>
            <span className="text-sm text-gray-600">
              Sous-total: {vendor.subtotal.toLocaleString('fr-DZ')} DA
            </span>
          </div>

          <div className="divide-y divide-gray-200">
            {vendor.items.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center py-3 gap-4"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded object-cover border"
                  />
                )}

                <div className="flex-1">
                  <Link
                    href={`/products/${item.product_id}`}
                    className="font-semibold text-gray-900 hover:text-orange-600"
                  >
                    {item.name}
                  </Link>
                  <div className="text-sm text-gray-500">
                    {item.price.toLocaleString('fr-DZ')} DA · Stock max{' '}
                    {item.max_stock}
                  </div>
                  <div className="text-sm text-gray-700">
                    Sous-total:{' '}
                    {(item.price * item.quantity).toLocaleString('fr-DZ')} DA
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity - 1)
                    }
                    className="w-8 h-8 rounded border text-lg leading-none text-gray-700 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product_id, item.quantity + 1)
                    }
                    className="w-8 h-8 rounded border text-lg leading-none text-gray-700 hover:bg-gray-100"
                    disabled={item.quantity >= item.max_stock}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.product_id)}
                  className="text-xs text-red-600 hover:underline ml-2"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push('/checkout')}
          className="inline-flex items-center px-5 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700"
        >
          Procéder au paiement
        </button>
      </div>
    </main>
  );
}
