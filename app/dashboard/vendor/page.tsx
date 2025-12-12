// app/dashboard/vendor/page.tsx
export default function DashboardVendorPage() {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="bg-white shadow rounded-lg p-6 mb-8 flex justify-between items-center border-b-4 border-green-600">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Vendeur</h1>
              <p className="text-green-600 font-medium">Boutique active</p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Vérifié par SMS
            </span>
          </header>
  
          {/* Alerte KYB */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong className="font-medium text-yellow-800">Compte en attente de validation (KYB).</strong>
                  {' '}Vous devez envoyer vos documents (Registre de commerce / Carte artisan) pour activer vos ventes.
                </p>
              </div>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <h3 className="text-gray-500 text-sm font-medium">Vue Boutique</h3>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
  
          <div className="mt-8">
             <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow flex items-center gap-2">
               <span>+</span> Ajouter un produit
             </button>
          </div>
        </div>
      </div>
    )
  }