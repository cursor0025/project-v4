// app/(auth)/register/page.tsx
import Link from 'next/link'

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold text-gray-900">Rejoignez BZMarket</h2>
        <div className="space-y-4 mt-6">
          <Link href="/register/client" className="block p-6 border-2 border-orange-500 rounded-xl hover:bg-orange-50 transition">
            <h3 className="text-xl font-bold text-orange-600">Client</h3>
            <p className="text-sm text-gray-500">J'achète des produits</p>
          </Link>
          <Link href="/register/vendor" className="block p-6 border-2 border-green-500 rounded-xl hover:bg-green-50 transition">
            <h3 className="text-xl font-bold text-green-600">Vendeur</h3>
            <p className="text-sm text-gray-500">Je vends mes produits</p>
          </Link>
        </div>
        <div className="mt-6 text-sm">
          Déjà un compte ? <Link href="/login" className="font-bold underline">Se connecter</Link>
        </div>
      </div>
    </div>
  )
}