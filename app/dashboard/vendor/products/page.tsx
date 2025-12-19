// app/dashboard/vendor/products/page.tsx
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Mes Produits | BZMarket' }

export default async function VendorProductsList() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes Produits</h1>
        <Link 
          href="/dashboard/vendor/products/create" 
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium flex items-center gap-2"
        >
          + Ajouter un produit
        </Link>
      </div>

      {(!products || products.length === 0) ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Vous n'avez pas encore mis d'articles en vente.</p>
          <Link href="/dashboard/vendor/products/create" className="text-orange-600 font-bold hover:underline">
            Commencer à vendre
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Produit</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Prix</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Stock</th>
                <th className="p-4 text-sm font-semibold text-gray-600">État</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden relative border">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{product.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">{product.price.toLocaleString()} DA</td>
                  <td className="p-4 text-gray-600">{product.stock}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.status === 'active' ? 'En ligne' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-gray-400 hover:text-orange-600 text-sm font-medium">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}