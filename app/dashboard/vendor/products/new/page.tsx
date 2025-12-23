// app/dashboard/vendor/products/new/page.tsx
import AddProductForm from '@/components/dashboard/AddProductForm'
import Link from 'next/link'

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <Link href="/dashboard/vendor" className="text-orange-600 hover:underline">
          ← Retour au tableau de bord
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-8">Ajouter un nouveau produit</h1>
      <AddProductForm />
    </div>
  )
}