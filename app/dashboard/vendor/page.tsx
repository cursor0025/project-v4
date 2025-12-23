// app/dashboard/vendor/page.tsx
import Link from 'next/link'
import ProductList from '@/components/dashboard/ProductList'
import { Package, Plus, Store, TrendingUp } from 'lucide-react'

export default function VendorDashboard() {
  return (
    <div className="space-y-8">
      {/* EN-TÊTE DU DASHBOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Vendeur</h1>
          <p className="text-gray-500">Gérez vos produits et suivez vos ventes sur BZMarket.</p>
        </div>
        <Link 
          href="/dashboard/vendor/products/new"
          className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-md active:scale-95"
        >
          <Plus size={20} />
          Ajouter un produit
        </Link>
      </div>

      {/* STATISTIQUES RAPIDES (FRONTEND PLACEHOLDER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Produits Actifs</p>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ventes totales</p>
            <p className="text-2xl font-bold text-gray-900">0 DA</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Store size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Statut Boutique</p>
            <p className="text-sm font-bold text-green-600">Ouverte</p>
          </div>
        </div>
      </div>

      {/* SECTION LISTE DES PRODUITS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Mes Produits récents</h2>
          <Link href="/dashboard/vendor/products" className="text-sm text-orange-600 font-medium hover:underline">
            Voir tout
          </Link>
        </div>
        
        {/* Affichage de la liste réelle connectée à Supabase */}
        <ProductList />
      </div>
    </div>
  )
}