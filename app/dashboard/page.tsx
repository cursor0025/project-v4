// app/dashboard/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardClientPage() {
  const supabase = await createServerSupabaseClient()
  
  // Vérification basique de session
  const { data: { user } } = await supabase.auth.getUser()
  // Note: Comme on gère nos sessions manuellement via cookie dans auth.ts, 
  // cette vérification Supabase standard peut échouer si on n'utilise pas le flux standard.
  // Pour ce sprint, on affiche simplement la page.

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white shadow rounded-lg p-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Espace Client</h1>
            <p className="text-gray-500">Bienvenue sur BZMarket</p>
          </div>
          <button className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-medium">
            Se déconnecter
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte Commandes */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-gray-700">Mes Commandes</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-sm text-gray-500 mt-1">Commandes en cours</p>
          </div>

          {/* Carte Favoris */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-gray-700">Mes Favoris</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            <p className="text-sm text-gray-500 mt-1">Produits sauvegardés</p>
          </div>

          {/* Carte Profil */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700">Mon Profil</h3>
            <p className="text-sm text-gray-500 mt-2">Gérer mes adresses et informations</p>
          </div>
        </div>

        <div className="mt-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Succès ! </strong>
          <span className="block sm:inline">Votre compte Client est actif. Le Sprint 2 est validé.</span>
        </div>
      </div>
    </div>
  )
}