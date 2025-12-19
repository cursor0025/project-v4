// components/vendor/CategorySelector.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = {
  id: number
  name: string
  parent_id: number | null
  icon: string | null
  slug: string
}

export default function CategorySelector({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [selectedParent, setSelectedParent] = useState<number | null>(null)
  
  // Filtrer les parents (sans parent_id) et les enfants
  const parentCategories = categories.filter(c => c.parent_id === null)
  const subCategories = selectedParent 
    ? categories.filter(c => c.parent_id === selectedParent)
    : []

  const handleSubCategoryClick = (categoryId: number) => {
    // Redirection vers l'étape suivante avec l'ID de la catégorie
    router.push(`/dashboard/vendor/products/create/details?category_id=${categoryId}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Barre de titre */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">
          {selectedParent ? 'Étape 2 : Précisez la catégorie' : 'Étape 1 : Que vendez-vous ?'}
        </h2>
        {selectedParent && (
          <button 
            onClick={() => setSelectedParent(null)}
            className="text-sm text-orange-600 hover:text-orange-800 font-medium"
          >
            ← Retour
          </button>
        )}
      </div>

      <div className="p-6">
        {/* GRILLE DES CATÉGORIES PRINCIPALES */}
        {!selectedParent && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {parentCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedParent(cat.id)}
                className="flex flex-col items-center justify-center p-6 border rounded-xl hover:border-orange-500 hover:bg-orange-50 transition group h-36"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center mb-3 text-2xl shadow-sm">
                  {/* Icône placeholder */}
                  📦
                </div>
                <span className="text-sm font-bold text-center text-gray-700 group-hover:text-orange-700">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* LISTE DES SOUS-CATÉGORIES */}
        {selectedParent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subCategories.length > 0 ? (
              subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSubCategoryClick(sub.id)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-left group"
                >
                  <span className="font-medium text-gray-700 group-hover:text-orange-700">{sub.name}</span>
                  <span className="text-gray-400 group-hover:text-orange-500">Sélectionner →</span>
                </button>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500 mb-4">Pas de sous-catégorie.</p>
                <button 
                   onClick={() => handleSubCategoryClick(selectedParent)}
                   className="text-white bg-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-700"
                >
                  Continuer avec cette catégorie
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}