// app/dashboard/vendor/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardVendorPage() {
  const supabase = await createServerSupabaseClient()

  // 1. Vérification de sécurité : Est-ce qu'il est connecté ?
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Récupérer les infos de la boutique
  const { data: vendor } = await supabase
    .from('vendors') //
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Si l'utilisateur est un vendeur mais n'a pas fini l'inscription boutique
  if (!vendor) redirect('/register/vendor')

  // 3. Déterminer l'état du compte
  const isApproved = vendor.kyb_status === 'approved'
  const isPending = vendor.kyb_status === 'pending_review'
  const isRejected = vendor.kyb_status === 'rejected'

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* EN-TÊTE DYNAMIQUE */}
        <header className={`bg-white shadow rounded-lg p-6 mb-8 flex justify-between items-center border-b-4 ${isApproved ? 'border-green-600' : 'border-yellow-500'}`}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Espace Vendeur</h1>
            <p className={`${isApproved ? 'text-green-600' : 'text-yellow-600'} font-medium`}>
              {vendor.shop_name} • {isApproved ? 'Boutique Active' : 'En attente de validation'}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Vérifié par SMS
            </span>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-orange-600 underline">
              Retour au mode client
            </Link>
          </div>
        </header>

        {/* ALERTE : EN ATTENTE (Visible seulement si non validé) */}
        {isPending && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong className="font-bold">Vos documents sont en cours d'examen.</strong>
                  <br/>
                  L'ajout de produits sera débloqué une fois votre Registre de Commerce validé par l'administration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATISTIQUES (Vides pour l'instant) */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${!isApproved ? 'opacity-50' : ''}`}>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Ventes Totales</h3>
            <p className="text-2xl font-bold text-gray-900">0 DA</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Commandes</h3>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Produits</h3>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Vues Boutique</h3>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* BOUTON D'ACTION PRINCIPAL */}
        <div className="mt-8">
           {isApproved ? (
             // CAS 1 : APPROUVÉ -> Le bouton marche et mène vers la création
             <Link 
               href="/dashboard/vendor/products/create"
               className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow transition transform hover:-translate-y-0.5"
             >
               <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
               Ajouter un produit
             </Link>
           ) : (
             // CAS 2 : NON APPROUVÉ -> Le bouton est gris et bloqué
             <button disabled className="bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-lg cursor-not-allowed flex items-center">
               <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
               Ajout bloqué (Validation requise)
             </button>
           )}
        </div>

      </div>
    </div>
  )
}