// app/dashboard/vendor/products/create/page.tsx
import { getCategories } from '@/app/actions/product'
import CategorySelector from '@/components/vendor/CategorySelector'
import Link from 'next/link'

export const metadata = { title: 'Ajouter un produit | BZMarket' }

// 👇 C'est cette ligne qui est cruciale : "export default"
export default async function CreateProductPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-6">
          <Link 
            href="/dashboard/vendor" 
            className="text-sm text-gray-500 hover:text-orange-600 flex items-center gap-1 mb-2"
          >
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau Produit</h1>
          <p className="text-gray-600">Choisissez la catégorie qui correspond le mieux à votre article.</p>
        </div>

        {/* Si ce composant est rouge, c'est qu'il n'est pas encore créé */}
        <CategorySelector categories={categories} />

      </div>
    </div>
  )
}