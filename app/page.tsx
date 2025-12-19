import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-black">Bienvenue sur BZMarket</h1>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Se connecter
        </Link>
        <Link href="/dashboard" className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          Accéder au Dashboard
        </Link>
      </div>
    </div>
  )
}