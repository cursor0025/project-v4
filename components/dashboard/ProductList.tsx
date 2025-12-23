// components/dashboard/ProductList.tsx
'use client'

import { useEffect, useState } from 'react'
import { getVendorProducts } from '@/app/actions/product'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    async function fetchProducts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (vendor) {
          const result = await getVendorProducts(vendor.id)
          if (result.success) setProducts(result.data || [])
        }
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  if (loading) return <div className="p-4 text-center">Chargement de vos produits...</div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-sm font-bold text-gray-700">Produit</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-700">Catégorie</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-700">Prix</th>
            <th className="px-6 py-4 text-sm font-bold text-gray-700">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                Aucun produit en vente pour le moment.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-gray-600 capitalize">{product.category}</td>
                <td className="px-6 py-4 text-orange-600 font-bold">{product.price} DA</td>
                <td className="px-6 py-4 text-gray-600">{product.stock} unités</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}